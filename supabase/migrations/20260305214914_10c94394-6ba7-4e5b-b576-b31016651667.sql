
-- ============================================
-- KIVARA Phase B: Ledger & Wallets
-- ============================================

-- 1. Wallet type enum
CREATE TYPE public.wallet_type AS ENUM ('virtual', 'real');

-- 2. Transaction type enum  
CREATE TYPE public.ledger_entry_type AS ENUM (
  'allowance',      -- mesada
  'task_reward',     -- recompensa por tarefa
  'mission_reward',  -- recompensa por missão
  'purchase',        -- compra na loja
  'donation',        -- doação
  'vault_deposit',   -- depósito no cofre
  'vault_withdraw',  -- levantamento do cofre
  'vault_interest',  -- juros simulados
  'transfer',        -- transferência entre carteiras
  'adjustment',      -- ajuste manual (admin/parent)
  'refund'           -- devolução
);

-- 3. Wallets table
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallet_type wallet_type NOT NULL DEFAULT 'virtual',
  currency TEXT NOT NULL DEFAULT 'KVC', -- KVC = KivaCoin
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, wallet_type, currency)
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Ledger entries (double-entry, append-only)
CREATE TABLE public.ledger_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Double-entry: every transaction has debit AND credit
  debit_wallet_id UUID NOT NULL REFERENCES public.wallets(id),
  credit_wallet_id UUID NOT NULL REFERENCES public.wallets(id),
  
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  entry_type ledger_entry_type NOT NULL,
  
  description TEXT NOT NULL,
  reference_id UUID, -- links to task, mission, vault, etc.
  reference_type TEXT, -- 'task', 'mission', 'vault', 'store_item', etc.
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Approval tracking
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  
  -- Immutability: no updates, only inserts
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Prevent self-transfers within same wallet
  CONSTRAINT different_wallets CHECK (debit_wallet_id != credit_wallet_id)
);
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_ledger_debit_wallet ON public.ledger_entries(debit_wallet_id);
CREATE INDEX idx_ledger_credit_wallet ON public.ledger_entries(credit_wallet_id);
CREATE INDEX idx_ledger_created_at ON public.ledger_entries(created_at DESC);
CREATE INDEX idx_ledger_entry_type ON public.ledger_entries(entry_type);

-- 5. System wallet (for minting/burning coins)
-- This is the "bank" — source of allowances, rewards, etc.
INSERT INTO public.wallets (id, profile_id, wallet_type, currency, is_active)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  p.id,
  'virtual',
  'KVC',
  true
FROM public.profiles p
LIMIT 0; -- We'll create this via edge function or seed

-- 6. View: Wallet balances derived from ledger
CREATE OR REPLACE VIEW public.wallet_balances AS
SELECT 
  w.id AS wallet_id,
  w.profile_id,
  w.wallet_type,
  w.currency,
  COALESCE(credits.total, 0) - COALESCE(debits.total, 0) AS balance
FROM public.wallets w
LEFT JOIN (
  SELECT credit_wallet_id AS wallet_id, SUM(amount) AS total
  FROM public.ledger_entries
  WHERE approved_at IS NOT NULL OR requires_approval = false
  GROUP BY credit_wallet_id
) credits ON credits.wallet_id = w.id
LEFT JOIN (
  SELECT debit_wallet_id AS wallet_id, SUM(amount) AS total
  FROM public.ledger_entries
  WHERE approved_at IS NOT NULL OR requires_approval = false
  GROUP BY debit_wallet_id
) debits ON debits.wallet_id = w.id;

-- 7. View: Recent transactions for a wallet
CREATE OR REPLACE VIEW public.wallet_transactions AS
SELECT 
  le.id,
  le.amount,
  le.entry_type,
  le.description,
  le.created_at,
  le.metadata,
  le.requires_approval,
  le.approved_at,
  le.debit_wallet_id,
  le.credit_wallet_id,
  CASE 
    WHEN le.credit_wallet_id = w.id THEN 'credit'
    ELSE 'debit'
  END AS direction,
  w.id AS wallet_id,
  w.profile_id
FROM public.ledger_entries le
CROSS JOIN public.wallets w
WHERE le.debit_wallet_id = w.id OR le.credit_wallet_id = w.id;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Wallets: users see own + household members' wallets
CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid() 
         OR household_id = public.get_user_household_id(auth.uid())
    )
  );

CREATE POLICY "System can create wallets"
  ON public.wallets FOR INSERT
  WITH CHECK (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'parent')
    OR public.has_role(auth.uid(), 'admin')
  );

-- Ledger entries: viewable by wallet owners and parents in same household
CREATE POLICY "Users can view own ledger entries"
  ON public.ledger_entries FOR SELECT
  USING (
    debit_wallet_id IN (
      SELECT w.id FROM public.wallets w 
      JOIN public.profiles p ON w.profile_id = p.id
      WHERE p.user_id = auth.uid() 
         OR p.household_id = public.get_user_household_id(auth.uid())
    )
    OR credit_wallet_id IN (
      SELECT w.id FROM public.wallets w 
      JOIN public.profiles p ON w.profile_id = p.id
      WHERE p.user_id = auth.uid() 
         OR p.household_id = public.get_user_household_id(auth.uid())
    )
  );

CREATE POLICY "Parents can create ledger entries"
  ON public.ledger_entries FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'parent')
    OR public.has_role(auth.uid(), 'admin')
  );

-- No UPDATE or DELETE on ledger_entries (append-only / immutable)

-- ============================================
-- AUTO-CREATE WALLET ON PROFILE CREATION
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_profile_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (profile_id, wallet_type, currency)
  VALUES (NEW.id, 'virtual', 'KVC');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_wallet();

-- ============================================
-- FUNCTION: Get balance for a profile
-- ============================================

CREATE OR REPLACE FUNCTION public.get_profile_balance(_profile_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT balance FROM public.wallet_balances 
     WHERE profile_id = _profile_id AND wallet_type = 'virtual' AND currency = 'KVC'
     LIMIT 1),
    0
  )
$$;

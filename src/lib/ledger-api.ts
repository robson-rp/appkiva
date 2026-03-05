import { supabase } from '@/integrations/supabase/client';

export type LedgerEntryType =
  | 'allowance'
  | 'task_reward'
  | 'mission_reward'
  | 'purchase'
  | 'donation'
  | 'vault_deposit'
  | 'vault_withdraw'
  | 'vault_interest'
  | 'transfer'
  | 'adjustment'
  | 'refund';

export interface CreateTransactionRequest {
  entry_type: LedgerEntryType;
  amount: number;
  description: string;
  target_profile_id?: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateTransactionResponse {
  success: boolean;
  entry: Record<string, unknown>;
  requires_approval: boolean;
  new_balance: number | null;
}

export async function createTransaction(req: CreateTransactionRequest): Promise<CreateTransactionResponse> {
  const { data, error } = await supabase.functions.invoke('create-transaction', {
    body: req,
  });

  if (error) {
    throw new Error(error.message || 'Erro ao criar transacção');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as CreateTransactionResponse;
}

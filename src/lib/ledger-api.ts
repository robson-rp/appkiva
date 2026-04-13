import { api } from '@/lib/api-client';

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
  idempotency_key?: string;
}

export interface CreateTransactionResponse {
  success: boolean;
  entry: Record<string, unknown>;
  requires_approval: boolean;
  new_balance: number | null;
  idempotent_hit?: boolean;
}

function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

export async function createTransaction(req: CreateTransactionRequest): Promise<CreateTransactionResponse> {
  // Auto-generate idempotency key if not provided
  const requestWithKey = {
    ...req,
    idempotency_key: req.idempotency_key || generateIdempotencyKey(),
  };

  const data = await api.post<CreateTransactionResponse>('/wallets/transactions', requestWithKey);

  return data;
}

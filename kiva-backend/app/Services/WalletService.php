<?php

namespace App\Services;

use App\Events\WalletTransfer;
use App\Models\LedgerEntry;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class WalletService
{
    /**
     * Create a ledger entry (double-entry). All financial operations go through here.
     * Wraps everything in a DB transaction with row-level locking.
     */
    public function createTransaction(array $data): LedgerEntry
    {
        return DB::transaction(function () use ($data) {
            // Check idempotency key
            if (!empty($data['idempotency_key'])) {
                $existing = LedgerEntry::where('idempotency_key', $data['idempotency_key'])->first();
                if ($existing) {
                    return $existing;
                }
            }

            // Lock debit wallet and check balance/frozen state
            if (!empty($data['debit_wallet_id'])) {
                $debitWallet = Wallet::where('id', $data['debit_wallet_id'])->lockForUpdate()->firstOrFail();

                if ($debitWallet->is_frozen) {
                    throw new \RuntimeException('Wallet is frozen: ' . ($debitWallet->freeze_reason ?? 'no reason given'));
                }

                $balance = (float) $debitWallet->balance;
                $amount  = (float) $data['amount'];

                if ($balance < $amount) {
                    throw new \RuntimeException('Insufficient balance. Available: ' . $balance . ', requested: ' . $amount);
                }
            }

            $entry = LedgerEntry::create([
                'credit_wallet_id' => $data['credit_wallet_id'] ?? null,
                'debit_wallet_id'  => $data['debit_wallet_id'] ?? null,
                'amount'           => $data['amount'],
                'description'      => strip_tags($data['description'] ?? null),
                'entry_type'       => $data['entry_type'],
                'created_by'       => $data['created_by'] ?? null,
                'approved_by'      => $data['approved_by'] ?? null,
                'approved_at'      => $data['approved_at'] ?? null,
                'requires_approval' => $data['requires_approval'] ?? false,
                'idempotency_key'  => $data['idempotency_key'] ?? null,
                'reference_id'     => $data['reference_id'] ?? null,
                'reference_type'   => $data['reference_type'] ?? null,
                'metadata'         => $data['metadata'] ?? null,
            ]);

            event(new WalletTransfer($entry));

            return $entry;
        });
    }

    public function getBalance(Wallet $wallet): string
    {
        return $wallet->balance;
    }
}

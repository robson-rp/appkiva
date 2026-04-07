<?php

namespace App\Jobs;

use App\Models\SavingsVault;
use App\Models\LedgerEntry;
use App\Models\Wallet;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ProcessVaultInterestJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        SavingsVault::where('interest_rate', '>', 0)->each(function (SavingsVault $vault) {
            DB::transaction(function () use ($vault) {
                $interest = $vault->current_amount * ($vault->interest_rate / 100);

                if ($interest <= 0) {
                    return;
                }

                $wallet = Wallet::where('profile_id', $vault->profile_id)
                    ->where('wallet_type', 'virtual')
                    ->first();

                if ($wallet) {
                    LedgerEntry::create([
                        'credit_wallet_id' => $wallet->id,
                        'amount'           => $interest,
                        'entry_type'       => 'vault_interest',
                        'description'      => 'Monthly interest for vault: ' . $vault->name,
                        'idempotency_key'  => 'vault_interest_' . $vault->id . '_' . now()->format('Y_m'),
                        'reference_id'     => $vault->id,
                        'reference_type'   => 'savings_vault',
                    ]);
                }

                $vault->increment('current_amount', $interest);
            });
        });
    }
}

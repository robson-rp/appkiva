<?php

namespace App\Jobs;

use App\Models\AllowanceConfig;
use App\Models\Wallet;
use App\Models\LedgerEntry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SendAllowanceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly AllowanceConfig $config) {}

    public function handle(): void
    {
        DB::transaction(function () {
            $wallet = Wallet::where('profile_id', $this->config->child_profile_id)
                ->where('wallet_type', 'virtual')
                ->where('is_active', true)
                ->first();

            if (!$wallet || $this->config->base_amount <= 0) {
                return;
            }

            $idempotencyKey = 'allowance_' . $this->config->id . '_' . now()->format('Y_W');

            $existing = LedgerEntry::where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return;
            }

            LedgerEntry::create([
                'credit_wallet_id' => $wallet->id,
                'amount'           => $this->config->base_amount,
                'entry_type'       => 'allowance',
                'description'      => 'Periodic allowance',
                'idempotency_key'  => $idempotencyKey,
                'reference_type'   => 'allowance_config',
                'reference_id'     => $this->config->id,
            ]);

            $this->config->update([
                'last_sent_at'    => now(),
                'next_payment_at' => $this->calculateNextPayment(),
            ]);
        });
    }

    protected function calculateNextPayment(): \Carbon\Carbon
    {
        return match ($this->config->frequency) {
            'daily'   => now()->addDay(),
            'monthly' => now()->addMonth(),
            default   => now()->addWeek(),
        };
    }
}

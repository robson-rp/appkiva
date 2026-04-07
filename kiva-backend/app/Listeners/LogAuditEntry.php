<?php

namespace App\Listeners;

use App\Events\WalletTransfer;
use App\Models\AuditLogEntry;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\DB;

class LogAuditEntry implements ShouldQueue
{
    public function handle(WalletTransfer $event): void
    {
        DB::table('audit_log')->insert([
            'id'            => \Illuminate\Support\Str::uuid(),
            'action'        => 'wallet_transfer',
            'resource_type' => 'ledger_entries',
            'resource_id'   => $event->entry->id,
            'profile_id'    => null,
            'user_id'       => null,
            'tenant_id'     => null,
            'new_values'    => json_encode([
                'amount'     => $event->entry->amount,
                'entry_type' => $event->entry->entry_type,
            ]),
            'metadata'      => null,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class LedgerEntry extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected $fillable = [
        'credit_wallet_id', 'debit_wallet_id', 'amount', 'description',
        'entry_type', 'created_by', 'approved_by', 'approved_at',
        'requires_approval', 'idempotency_key', 'reference_id',
        'reference_type', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount'            => 'decimal:4',
            'approved_at'       => 'datetime',
            'requires_approval' => 'boolean',
            'metadata'          => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll();
    }

    public function creditWallet(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Wallet::class, 'credit_wallet_id');
    }

    public function debitWallet(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Wallet::class, 'debit_wallet_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Wallet extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected $fillable = [
        'profile_id', 'wallet_type', 'currency', 'is_active',
        'is_frozen', 'is_system', 'freeze_reason', 'frozen_at', 'frozen_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_frozen' => 'boolean',
            'is_system' => 'boolean',
            'frozen_at' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
    }

    /**
     * Get the wallet balance calculated via the wallet_balances view.
     * NEVER read a balance column from the wallets table directly.
     */
    public function getBalanceAttribute(): string
    {
        $row = DB::table('wallet_balances')->where('wallet_id', $this->id)->first();

        return $row ? $row->balance : '0.0000';
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    public function creditEntries(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(LedgerEntry::class, 'credit_wallet_id');
    }

    public function debitEntries(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(LedgerEntry::class, 'debit_wallet_id');
    }
}

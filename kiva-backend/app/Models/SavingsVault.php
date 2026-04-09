<?php

namespace App\Models;

use App\Models\Scopes\TenantRelationScope;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class SavingsVault extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantRelationScope('profile'));
    }

    protected $fillable = [
        'profile_id', 'household_id', 'name', 'icon', 'current_amount',
        'target_amount', 'interest_rate', 'requires_parent_approval',
    ];

    protected function casts(): array
    {
        return [
            'current_amount'          => 'decimal:4',
            'target_amount'           => 'decimal:4',
            'interest_rate'           => 'decimal:4',
            'requires_parent_approval' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['current_amount', 'target_amount'])->logOnlyDirty();
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }
}

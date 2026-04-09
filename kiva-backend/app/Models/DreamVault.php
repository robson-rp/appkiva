<?php

namespace App\Models;

use App\Models\Scopes\TenantRelationScope;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DreamVault extends Model
{
    use HasFactory, HasUuids;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantRelationScope('profile'));
    }

    protected $fillable = [
        'profile_id', 'household_id', 'title', 'description', 'icon',
        'priority', 'current_amount', 'target_amount',
    ];

    protected function casts(): array
    {
        return [
            'current_amount' => 'decimal:4',
            'target_amount'  => 'decimal:4',
            'priority'       => 'integer',
        ];
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    public function comments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DreamVaultComment::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionTier extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name', 'tier_type', 'price_monthly', 'price_yearly', 'max_children',
        'max_classrooms', 'max_guardians', 'max_programs', 'monthly_emission_limit',
        'extra_child_price', 'currency', 'features', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'features'              => 'array',
            'is_active'             => 'boolean',
            'price_monthly'         => 'decimal:2',
            'price_yearly'          => 'decimal:2',
            'monthly_emission_limit' => 'decimal:4',
            'extra_child_price'     => 'decimal:2',
        ];
    }

    public function tenants(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Tenant::class);
    }
}

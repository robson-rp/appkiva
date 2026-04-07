<?php

namespace App\Models;

use App\Interfaces\Tenantable;
use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Tenant extends Model implements Tenantable
{
    use HasFactory, HasUuids, LogsActivity;

    protected $fillable = [
        'name', 'slug', 'tenant_type', 'currency', 'settings',
        'is_active', 'subscription_tier_id', 'extra_children_purchased', 'real_money_enabled',
    ];

    protected function casts(): array
    {
        return [
            'settings'                  => 'array',
            'is_active'                 => 'boolean',
            'real_money_enabled'        => 'boolean',
            'extra_children_purchased'  => 'integer',
        ];
    }

    public function getTenantIdColumn(): string
    {
        return 'id';
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
    }

    public function subscriptionTier(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(SubscriptionTier::class);
    }

    public function households(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Household::class);
    }

    public function profiles(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Profile::class);
    }

    public function invoices(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SubscriptionInvoice::class);
    }
}

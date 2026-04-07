<?php

namespace App\Models;

use App\Interfaces\Tenantable;
use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Household extends Model implements Tenantable
{
    use HasFactory, HasUuids;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    protected $fillable = [
        'name', 'tenant_id', 'monthly_emission_limit_override',
    ];

    protected function casts(): array
    {
        return [
            'monthly_emission_limit_override' => 'decimal:4',
        ];
    }

    public function getTenantIdColumn(): string
    {
        return 'tenant_id';
    }

    public function guardians(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HouseholdGuardian::class);
    }

    public function profiles(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Profile::class);
    }

    public function tenant(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function inviteCodes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(FamilyInviteCode::class);
    }
}

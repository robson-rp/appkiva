<?php

namespace App\Models;

use App\Models\Scopes\TenantRelationScope;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Child extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantRelationScope('profile'));
    }

    protected $fillable = [
        'profile_id', 'parent_profile_id', 'nickname', 'username',
        'pin_hash', 'date_of_birth', 'daily_spend_limit',
        'monthly_budget', 'school_tenant_id',
    ];

    protected $hidden = [
        'pin_hash',
        'date_of_birth', // NEVER expose in API responses
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth'    => 'date',
            'daily_spend_limit' => 'decimal:4',
            'monthly_budget'   => 'decimal:4',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly([
            'nickname', 'username', 'school_tenant_id',
            'daily_spend_limit', 'monthly_budget',
        ])->logOnlyDirty();
    }

    public function getAgeGroupAttribute(): string
    {
        if (!$this->date_of_birth) {
            return 'child';
        }

        $age = $this->date_of_birth->age;

        return $age >= 13 ? 'teen' : 'child';
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    public function parentProfile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'parent_profile_id');
    }

    public function schoolTenant(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'school_tenant_id');
    }

    public function allowanceConfig(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(AllowanceConfig::class, 'child_profile_id', 'profile_id');
    }
}

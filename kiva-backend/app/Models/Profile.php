<?php

namespace App\Models;

use App\Interfaces\Tenantable;
use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model implements Tenantable
{
    use HasFactory, HasUuids;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    protected $fillable = [
        'user_id', 'display_name', 'username', 'avatar', 'household_id',
        'tenant_id', 'language', 'country', 'phone', 'gender',
        'sector', 'institution_name', 'ranking_visibility', 'email_preferences',
    ];

    protected $hidden = [
        // date_of_birth lives on children table, never exposed here
    ];

    protected function casts(): array
    {
        return [
            'ranking_visibility' => 'boolean',
            'email_preferences'  => 'array',
        ];
    }

    public function getTenantIdColumn(): string
    {
        return 'tenant_id';
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function household(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    public function tenant(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function child(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Child::class);
    }

    public function wallets(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Wallet::class);
    }

    public function tasks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Task::class, 'child_profile_id');
    }

    public function missions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Mission::class, 'child_profile_id');
    }

    public function notifications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(KivaNotification::class);
    }

    public function badgeProgress(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BadgeProgress::class);
    }

    public function streak(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Streak::class);
    }

    public function householdGuardian(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(HouseholdGuardian::class);
    }

    public function savingsVaults(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SavingsVault::class);
    }

    public function dreamVaults(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DreamVault::class);
    }

    public function lessonProgress(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function diaryEntries(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DiaryEntry::class);
    }
}

<?php

namespace App\Models;

use App\Models\Scopes\TenantRelationScope;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Mission extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantRelationScope('childProfile'));
    }

    protected $fillable = [
        'child_profile_id', 'parent_profile_id', 'household_id',
        'title', 'description', 'type', 'difficulty', 'status', 'source',
        'reward', 'kiva_points_reward', 'target_amount', 'week',
        'is_auto_generated', 'expires_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'reward'           => 'decimal:4',
            'target_amount'    => 'decimal:4',
            'kiva_points_reward' => 'integer',
            'is_auto_generated' => 'boolean',
            'expires_at'       => 'datetime',
            'completed_at'     => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['status', 'completed_at'])->logOnlyDirty();
    }

    public function childProfile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'child_profile_id');
    }

    public function parentProfile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'parent_profile_id');
    }
}

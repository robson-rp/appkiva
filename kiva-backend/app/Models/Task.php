<?php

namespace App\Models;

use App\Models\Scopes\TenantRelationScope;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Task extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantRelationScope('childProfile'));
    }

    protected $fillable = [
        'child_profile_id', 'parent_profile_id', 'household_id',
        'title', 'description', 'reward', 'status', 'category',
        'is_recurring', 'recurrence', 'recurrence_source_id',
        'approved_at', 'approved_by', 'completed_at', 'due_date',
    ];

    protected function casts(): array
    {
        return [
            'reward'       => 'decimal:4',
            'is_recurring' => 'boolean',
            'approved_at'  => 'datetime',
            'completed_at' => 'datetime',
            'due_date'     => 'date',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['status', 'approved_at', 'completed_at'])->logOnlyDirty();
    }

    public function childProfile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'child_profile_id');
    }

    public function parentProfile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'parent_profile_id');
    }

    public function household(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Household::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class AllowanceConfig extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected $fillable = [
        'child_profile_id', 'parent_profile_id', 'base_amount', 'frequency',
        'task_bonus', 'mission_bonus', 'last_sent_at', 'next_payment_at', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'base_amount'    => 'decimal:4',
            'task_bonus'     => 'decimal:4',
            'mission_bonus'  => 'decimal:4',
            'last_sent_at'   => 'datetime',
            'next_payment_at' => 'datetime',
            'is_active'      => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
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

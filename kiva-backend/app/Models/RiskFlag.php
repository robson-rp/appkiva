<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class RiskFlag extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected $fillable = [
        'profile_id', 'tenant_id', 'flag_type', 'severity', 'description',
        'metadata', 'resolved_by', 'resolved_at', 'resolution_notes',
    ];

    protected function casts(): array
    {
        return [
            'metadata'    => 'array',
            'resolved_at' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty();
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }
}

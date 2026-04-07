<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ConsentRecord extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected $fillable = [
        'adult_profile_id', 'child_profile_id', 'consent_type',
        'granted_at', 'revoked_at', 'revocation_reason', 'ip_metadata', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'granted_at'  => 'datetime',
            'revoked_at'  => 'datetime',
            'ip_metadata' => 'array',
            'metadata'    => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll();
    }

    public function adultProfile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'adult_profile_id');
    }

    public function childProfile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'child_profile_id');
    }
}

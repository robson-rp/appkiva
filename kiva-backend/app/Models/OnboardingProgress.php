<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingProgress extends Model
{
    use HasUuids;

    protected $table = 'onboarding_progress';

    protected $fillable = [
        'profile_id',
        'current_step',
        'completed',
        'skipped',
        'completed_at',
    ];

    protected $casts = [
        'completed'    => 'boolean',
        'skipped'      => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }
}

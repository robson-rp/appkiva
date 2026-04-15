<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingAnalytic extends Model
{
    use HasUuids;

    protected $table = 'onboarding_analytics';

    protected $fillable = [
        'profile_id',
        'event_type',
        'step_index',
        'role',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }
}

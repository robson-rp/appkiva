<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeeklyChallenge extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'profile_id', 'title', 'description', 'icon', 'type', 'status',
        'reward', 'kiva_points_reward', 'target_value', 'current_value',
        'participant_count', 'week_start', 'week_end',
    ];

    protected function casts(): array
    {
        return [
            'reward'           => 'decimal:4',
            'target_value'     => 'decimal:4',
            'current_value'    => 'decimal:4',
            'kiva_points_reward' => 'integer',
            'participant_count' => 'integer',
            'week_start'       => 'date',
            'week_end'         => 'date',
        ];
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }
}

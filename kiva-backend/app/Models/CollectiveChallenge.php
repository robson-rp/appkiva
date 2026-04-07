<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollectiveChallenge extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'classroom_id', 'teacher_profile_id', 'title', 'description', 'icon',
        'type', 'status', 'reward', 'kiva_points_reward', 'target_amount',
        'current_amount', 'start_date', 'end_date',
    ];

    protected function casts(): array
    {
        return [
            'reward'           => 'decimal:4',
            'target_amount'    => 'decimal:4',
            'current_amount'   => 'decimal:4',
            'kiva_points_reward' => 'integer',
            'start_date'       => 'date',
            'end_date'         => 'date',
        ];
    }

    public function classroom(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }
}

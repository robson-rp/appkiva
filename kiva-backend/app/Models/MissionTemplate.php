<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MissionTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'title', 'description', 'type', 'difficulty', 'reward_coins',
        'reward_points', 'target_amount', 'age_group', 'conditions',
        'is_active', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'reward_coins'  => 'decimal:4',
            'target_amount' => 'decimal:4',
            'reward_points' => 'integer',
            'conditions'    => 'array',
            'is_active'     => 'boolean',
        ];
    }
}

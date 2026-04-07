<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Streak extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'profile_id', 'current_streak', 'longest_streak',
        'last_active_date', 'total_active_days',
    ];

    protected function casts(): array
    {
        return [
            'current_streak'   => 'integer',
            'longest_streak'   => 'integer',
            'total_active_days' => 'integer',
            'last_active_date' => 'date',
        ];
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }
}

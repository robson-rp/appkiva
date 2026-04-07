<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LessonProgress extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'lesson_id', 'profile_id', 'score', 'kiva_points_earned', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'score'              => 'decimal:2',
            'kiva_points_earned' => 'integer',
            'completed_at'       => 'datetime',
        ];
    }

    public function lesson(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }
}

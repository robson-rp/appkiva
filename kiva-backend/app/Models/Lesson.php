<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'title', 'description', 'category', 'difficulty', 'estimated_minutes',
        'icon', 'blocks', 'quiz', 'kiva_points_reward', 'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'blocks'            => 'array',
            'quiz'              => 'array',
            'is_active'         => 'boolean',
            'kiva_points_reward' => 'integer',
            'sort_order'        => 'integer',
        ];
    }

    public function progress(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }
}

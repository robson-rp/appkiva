<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OnboardingStep extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'role', 'title', 'description', 'illustration_key',
        'cta', 'step_index', 'is_active', 'visible_from', 'visible_until',
    ];

    protected function casts(): array
    {
        return [
            'is_active'     => 'boolean',
            'step_index'    => 'integer',
            'visible_from'  => 'datetime',
            'visible_until' => 'datetime',
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name', 'description', 'icon', 'category', 'tier',
        'requirement', 'unlock_condition', 'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'unlock_condition' => 'array',
            'is_active'        => 'boolean',
            'sort_order'       => 'integer',
        ];
    }

    public function progress(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BadgeProgress::class);
    }
}

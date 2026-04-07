<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reward extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'parent_profile_id', 'household_id', 'name', 'description', 'icon',
        'price', 'category', 'available', 'claimed_by', 'claimed_at',
    ];

    protected function casts(): array
    {
        return [
            'price'      => 'decimal:4',
            'available'  => 'boolean',
            'claimed_at' => 'datetime',
        ];
    }

    public function parentProfile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'parent_profile_id');
    }

    public function claimedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'claimed_by');
    }
}

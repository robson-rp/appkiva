<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrustedDevice extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id', 'device_token', 'device_name', 'trusted_until', 'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'trusted_until' => 'datetime',
            'last_used_at'  => 'datetime',
        ];
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyInviteCode extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'household_id', 'created_by', 'code', 'status', 'expires_at', 'used_by', 'used_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at'    => 'datetime',
        ];
    }

    public function household(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Household::class);
    }
}

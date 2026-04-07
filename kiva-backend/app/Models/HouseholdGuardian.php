<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HouseholdGuardian extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'household_id', 'profile_id', 'role', 'invited_by', 'permission_level',
    ];

    public function household(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    public function invitedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'invited_by');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['profile_id', 'cause_id', 'amount'];

    protected function casts(): array
    {
        return ['amount' => 'decimal:4'];
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    public function cause(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DonationCause::class);
    }
}

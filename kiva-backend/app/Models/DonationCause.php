<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonationCause extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name', 'description', 'icon', 'category', 'is_active',
        'total_received', 'tenant_id', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active'      => 'boolean',
            'total_received' => 'decimal:4',
        ];
    }

    public function donations(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Donation::class, 'cause_id');
    }
}

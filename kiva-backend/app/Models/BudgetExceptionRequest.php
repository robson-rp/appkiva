<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudgetExceptionRequest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'child_profile_id', 'parent_profile_id', 'reward_id',
        'amount', 'reason', 'status', 'resolved_by', 'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'amount'      => 'decimal:4',
            'resolved_at' => 'datetime',
        ];
    }

    public function childProfile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'child_profile_id');
    }

    public function reward(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Reward::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionInvoice extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id', 'tier_id', 'amount', 'currency', 'status',
        'billing_period', 'due_date', 'paid_at', 'payment_method', 'payment_reference',
    ];

    protected function casts(): array
    {
        return [
            'amount'   => 'decimal:4',
            'due_date' => 'date',
            'paid_at'  => 'datetime',
        ];
    }

    public function tenant(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function tier(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(SubscriptionTier::class);
    }
}

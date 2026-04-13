<?php

namespace Database\Factories;

use App\Models\Tenant;
use App\Models\SubscriptionTier;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubscriptionInvoiceFactory extends Factory
{
    protected $model = \App\Models\SubscriptionInvoice::class;

    public function definition(): array
    {
        return [
            'tenant_id'        => Tenant::factory(),
            'tier_id'          => SubscriptionTier::factory(),
            'amount'           => fake()->randomFloat(2, 5, 100),
            'currency'         => 'EUR',
            'status'           => fake()->randomElement(['pending', 'paid', 'failed']),
            'billing_period'   => fake()->randomElement(['monthly', 'yearly']),
            'due_date'         => fake()->dateTimeBetween('now', '+30 days'),
            'paid_at'          => null,
            'payment_method'   => null,
            'payment_reference'=> null,
        ];
    }
}

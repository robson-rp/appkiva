<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SubscriptionTierFactory extends Factory
{
    protected $model = \App\Models\SubscriptionTier::class;

    public function definition(): array
    {
        return [
            'name'                   => fake()->randomElement(['Free', 'Basic', 'Pro', 'School']),
            'tier_type'              => fake()->randomElement(['free', 'family_premium', 'school_institutional', 'partner_program', 'teacher']),
            'price_monthly'          => fake()->randomFloat(2, 0, 50),
            'price_yearly'           => fake()->randomFloat(2, 0, 500),
            'max_children'           => fake()->numberBetween(1, 10),
            'max_classrooms'         => fake()->numberBetween(0, 20),
            'max_guardians'          => fake()->numberBetween(1, 5),
            'max_programs'           => fake()->numberBetween(0, 10),
            'monthly_emission_limit' => fake()->randomFloat(4, 0, 1000),
            'extra_child_price'      => fake()->randomFloat(2, 0, 10),
            'currency'               => 'EUR',
            'features'               => [],
            'is_active'              => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => ['is_active' => false]);
    }
}

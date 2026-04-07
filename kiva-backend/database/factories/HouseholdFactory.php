<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class HouseholdFactory extends Factory
{
    protected $model = \App\Models\Household::class;

    public function definition(): array
    {
        return [
            'name'      => fake()->lastName() . ' Family',
            'tenant_id' => null,
        ];
    }
}

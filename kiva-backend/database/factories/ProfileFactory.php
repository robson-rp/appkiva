<?php

namespace Database\Factories;

use App\Models\Household;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProfileFactory extends Factory
{
    protected $model = \App\Models\Profile::class;

    public function definition(): array
    {
        return [
            'user_id'          => User::factory(),
            'display_name'     => fake()->name(),
            'username'         => fake()->unique()->userName(),
            'avatar'           => null,
            'household_id'     => null,
            'tenant_id'        => null,
            'language'         => 'pt',
            'country'          => 'PT',
            'ranking_visibility' => true,
        ];
    }

    public function withHousehold(): static
    {
        return $this->state(fn(array $attributes) => [
            'household_id' => Household::factory(),
        ]);
    }
}

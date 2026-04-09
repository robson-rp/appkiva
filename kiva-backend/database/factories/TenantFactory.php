<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TenantFactory extends Factory
{
    protected $model = \App\Models\Tenant::class;

    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name'                     => $name,
            'slug'                     => Str::slug($name) . '-' . Str::lower(Str::random(4)),
            'tenant_type'              => 'family',
            'currency'                 => 'EUR',
            'is_active'                => true,
            'real_money_enabled'       => false,
            'extra_children_purchased' => 0,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => ['is_active' => false]);
    }
}

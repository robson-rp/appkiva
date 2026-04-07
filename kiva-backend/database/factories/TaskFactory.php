<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = \App\Models\Task::class;

    public function definition(): array
    {
        return [
            'child_profile_id'  => Profile::factory(),
            'parent_profile_id' => Profile::factory(),
            'title'             => fake()->sentence(4),
            'description'       => fake()->sentence(),
            'reward'            => fake()->randomFloat(4, 0, 20),
            'status'            => 'pending',
            'category'          => fake()->randomElement(['cleaning', 'studying', 'helping', 'other']),
            'is_recurring'      => false,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn($a) => ['status' => 'completed', 'completed_at' => now()]);
    }

    public function approved(): static
    {
        return $this->state(fn($a) => ['status' => 'approved', 'approved_at' => now()]);
    }
}

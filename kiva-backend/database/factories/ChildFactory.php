<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChildFactory extends Factory
{
    protected $model = \App\Models\Child::class;

    public function definition(): array
    {
        $childProfile  = Profile::factory()->create();
        $parentProfile = Profile::factory()->create();

        return [
            'profile_id'        => $childProfile->id,
            'parent_profile_id' => $parentProfile->id,
            'nickname'          => fake()->firstName(),
            'username'          => fake()->unique()->userName(),
            'pin_hash'          => bcrypt('1234'),
        ];
    }
}

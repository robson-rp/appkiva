<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

class WalletFactory extends Factory
{
    protected $model = \App\Models\Wallet::class;

    public function definition(): array
    {
        return [
            'profile_id'  => Profile::factory(),
            'wallet_type' => 'virtual',
            'currency'    => 'EUR',
            'is_active'   => true,
            'is_frozen'   => false,
            'is_system'   => false,
        ];
    }

    public function real(): static
    {
        return $this->state(fn($a) => ['wallet_type' => 'real']);
    }

    public function frozen(): static
    {
        return $this->state(fn($a) => [
            'is_frozen'    => true,
            'freeze_reason' => 'Test freeze',
            'frozen_at'    => now(),
        ]);
    }
}

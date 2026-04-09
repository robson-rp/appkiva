<?php

use App\Models\SavingsVault;
use App\Models\Wallet;
use App\Models\LedgerEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can list savings vaults via /api/v1/savings-vaults', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    SavingsVault::create([
        'profile_id' => $profile->id,
        'name'       => 'My Savings',
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/savings-vaults')
         ->assertStatus(200)
         ->assertJsonStructure(['data'])
         ->assertJsonCount(1, 'data');
});

it('can create a savings vault', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/savings-vaults', [
             'name'          => 'Holiday Fund',
             'target_amount' => 500,
         ])
         ->assertStatus(201)
         ->assertJsonPath('data.name', 'Holiday Fund');
});

it('can deposit to a vault', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    $wallet = Wallet::factory()->create([
        'profile_id'  => $profile->id,
        'wallet_type' => 'virtual',
        'is_active'   => true,
    ]);

    LedgerEntry::create([
        'credit_wallet_id' => $wallet->id,
        'amount'           => '200.0000',
        'entry_type'       => 'allowance',
    ]);

    $vault = SavingsVault::create([
        'profile_id' => $profile->id,
        'name'       => 'Deposit Vault',
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/savings-vaults/' . $vault->id . '/deposit', ['amount' => 50])
         ->assertStatus(200)
         ->assertJsonPath('data.current_amount', '50.0000');
});

it('can withdraw from a vault', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    $wallet = Wallet::factory()->create([
        'profile_id'  => $profile->id,
        'wallet_type' => 'virtual',
        'is_active'   => true,
    ]);

    $vault = SavingsVault::create([
        'profile_id'     => $profile->id,
        'name'           => 'Withdraw Vault',
        'current_amount' => '100.0000',
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/savings-vaults/' . $vault->id . '/withdraw', ['amount' => 30])
         ->assertStatus(200)
         ->assertJsonPath('data.current_amount', '70.0000');
});

it('cannot withdraw more than vault current_amount', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    $vault = SavingsVault::create([
        'profile_id'     => $profile->id,
        'name'           => 'Small Vault',
        'current_amount' => '10.0000',
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/savings-vaults/' . $vault->id . '/withdraw', ['amount' => 100])
         ->assertStatus(422)
         ->assertJsonPath('message', 'Insufficient vault balance.');
});

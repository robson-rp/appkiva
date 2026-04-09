<?php

use App\Models\Wallet;
use App\Models\LedgerEntry;
use App\Models\Household;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('GET /api/v1/wallets returns the authenticated user wallets', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    Wallet::factory()->create(['profile_id' => $profile->id, 'wallet_type' => 'virtual']);
    Wallet::factory()->create(['profile_id' => $profile->id, 'wallet_type' => 'real']);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/wallets')
         ->assertStatus(200)
         ->assertJsonStructure(['data'])
         ->assertJsonCount(2, 'data');
});

it('GET /api/v1/wallets/{id} returns a specific wallet', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();
    $wallet = Wallet::factory()->create(['profile_id' => $profile->id]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/wallets/' . $wallet->id)
         ->assertStatus(200)
         ->assertJsonPath('data.id', $wallet->id);
});

it('GET /api/v1/wallets/{id}/balance returns wallet balance', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();
    $wallet = Wallet::factory()->create(['profile_id' => $profile->id]);

    LedgerEntry::create([
        'credit_wallet_id' => $wallet->id,
        'amount'           => '75.0000',
        'entry_type'       => 'allowance',
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/wallets/' . $wallet->id . '/balance')
         ->assertStatus(200)
         ->assertJsonPath('data.wallet_id', $wallet->id)
         ->assertJsonPath('data.balance', fn($balance) => (float) $balance === 75.0);
});

it('GET /api/v1/wallets/{id}/transactions returns transaction list', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();
    $wallet = Wallet::factory()->create(['profile_id' => $profile->id]);

    LedgerEntry::create([
        'credit_wallet_id' => $wallet->id,
        'amount'           => '20.0000',
        'entry_type'       => 'allowance',
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/wallets/' . $wallet->id . '/transactions')
         ->assertStatus(200)
         ->assertJsonStructure(['data', 'meta'])
         ->assertJsonCount(1, 'data');
});

it('POST /api/v1/wallets/{id}/freeze freezes the wallet', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();
    $household = Household::factory()->create(['tenant_id' => $tenant->id]);
    $profile->update(['household_id' => $household->id]);
    $user->assignRole('parent');

    $wallet = Wallet::factory()->create(['profile_id' => $profile->id]);

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/wallets/' . $wallet->id . '/freeze', ['freeze_reason' => 'Testing'])
         ->assertStatus(200)
         ->assertJsonPath('data.is_frozen', true);
});

it('POST /api/v1/wallets/{id}/unfreeze unfreezes the wallet', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();
    $household = Household::factory()->create(['tenant_id' => $tenant->id]);
    $profile->update(['household_id' => $household->id]);
    $user->assignRole('parent');

    $wallet = Wallet::factory()->frozen()->create(['profile_id' => $profile->id]);

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/wallets/' . $wallet->id . '/unfreeze')
         ->assertStatus(200)
         ->assertJsonPath('data.is_frozen', false);
});

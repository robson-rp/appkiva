<?php

use App\Models\DonationCause;
use App\Models\Donation;
use App\Models\Wallet;
use App\Models\LedgerEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can list donation causes via /api/v1/donation-causes', function () {
    ['user' => $user, 'tenant' => $tenant] = $this->createUserInTenant();

    DonationCause::create(['name' => 'Plant Trees', 'is_active' => true]);
    DonationCause::create(['name' => 'Clean Water', 'is_active' => true]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/donation-causes')
         ->assertStatus(200)
         ->assertJsonStructure(['data', 'meta'])
         ->assertJsonCount(2, 'data');
});

it('old URL /api/v1/donations/causes returns 404 (route does not exist)', function () {
    ['user' => $user, 'tenant' => $tenant] = $this->createUserInTenant();

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/donations/causes')
         ->assertStatus(404);
});

it('can donate to a cause', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    $cause = DonationCause::create(['name' => 'Education Fund', 'is_active' => true]);

    $wallet = Wallet::factory()->create([
        'profile_id'  => $profile->id,
        'wallet_type' => 'virtual',
        'is_active'   => true,
    ]);

    LedgerEntry::create([
        'credit_wallet_id' => $wallet->id,
        'amount'           => '100.0000',
        'entry_type'       => 'allowance',
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/donations', [
             'cause_id' => $cause->id,
             'amount'   => 10.00,
         ])
         ->assertStatus(201)
         ->assertJsonPath('message', 'Donation successful.');

    expect(Donation::where('profile_id', $profile->id)->where('cause_id', $cause->id)->exists())->toBeTrue();
});

it('can list my donations via /api/v1/donations', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    $cause = DonationCause::create(['name' => 'Green Planet', 'is_active' => true]);

    Donation::create([
        'profile_id' => $profile->id,
        'cause_id'   => $cause->id,
        'amount'     => '5.0000',
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/donations')
         ->assertStatus(200)
         ->assertJsonStructure(['data', 'meta'])
         ->assertJsonCount(1, 'data');
});

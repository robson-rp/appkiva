<?php

use App\Models\SubscriptionTier;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can get current subscription', function () {
    ['user' => $user, 'tenant' => $tenant] = $this->createUserInTenant();

    $tier = SubscriptionTier::factory()->create(['is_active' => true]);
    $tenant->update(['subscription_tier_id' => $tier->id]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/subscription')
         ->assertStatus(200)
         ->assertJsonStructure(['data']);
});

it('returns null data when tenant has no subscription', function () {
    ['user' => $user, 'tenant' => $tenant] = $this->createUserInTenant();

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/subscription')
         ->assertStatus(200)
         ->assertJsonPath('data.subscription_tier_id', null)
         ->assertJsonPath('data.subscription_tier', null);
});

it('can list subscription tiers', function () {
    ['user' => $user, 'tenant' => $tenant] = $this->createUserInTenant();

    SubscriptionTier::factory()->count(3)->create(['is_active' => true]);
    SubscriptionTier::factory()->create(['is_active' => false]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/subscription/tiers')
         ->assertStatus(200)
         ->assertJsonCount(3, 'data');
});

it('can subscribe to a tier', function () {
    ['user' => $user, 'tenant' => $tenant] = $this->createUserInTenant();

    $tier = SubscriptionTier::factory()->create([
        'is_active'     => true,
        'price_monthly' => 9.99,
        'price_yearly'  => 99.00,
        'currency'      => 'EUR',
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/subscription/subscribe', [
             'tier_id'        => $tier->id,
             'billing_period' => 'monthly',
         ])
         ->assertStatus(200)
         ->assertJsonPath('data.subscription_tier_id', $tier->id);

    $tenant->refresh();
    expect($tenant->subscription_tier_id)->toBe($tier->id);
});

it('creates an invoice when subscribing', function () {
    ['user' => $user, 'tenant' => $tenant] = $this->createUserInTenant();

    $tier = SubscriptionTier::factory()->create([
        'is_active'     => true,
        'price_monthly' => 9.99,
        'currency'      => 'EUR',
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/subscription/subscribe', [
             'tier_id'        => $tier->id,
             'billing_period' => 'monthly',
         ])
         ->assertStatus(200);

    $this->assertDatabaseHas('subscription_invoices', [
        'tenant_id'      => $tenant->id,
        'tier_id'        => $tier->id,
        'billing_period' => 'monthly',
        'status'         => 'pending',
    ]);
});

it('can cancel subscription', function () {
    ['user' => $user, 'tenant' => $tenant] = $this->createUserInTenant();

    $tier = SubscriptionTier::factory()->create(['is_active' => true]);
    $tenant->update(['subscription_tier_id' => $tier->id]);

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/subscription/cancel')
         ->assertStatus(200);

    $tenant->refresh();
    expect($tenant->subscription_tier_id)->toBeNull();
});

it('returns 400 when cancelling with no active subscription', function () {
    ['user' => $user, 'tenant' => $tenant] = $this->createUserInTenant();

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/subscription/cancel')
         ->assertStatus(400);
});

it('can list invoices', function () {
    ['user' => $user, 'tenant' => $tenant] = $this->createUserInTenant();

    $tier = SubscriptionTier::factory()->create(['is_active' => true]);
    $tenant->update(['subscription_tier_id' => $tier->id]);

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/subscription/subscribe', [
             'tier_id'        => $tier->id,
             'billing_period' => 'monthly',
         ]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/subscription/invoices')
         ->assertStatus(200)
         ->assertJsonStructure(['data', 'meta']);
});

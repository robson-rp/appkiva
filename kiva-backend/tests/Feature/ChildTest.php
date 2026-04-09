<?php

use App\Models\User;
use App\Models\Profile;
use App\Models\Child;
use App\Models\Household;
use App\Models\Wallet;
use App\Models\Scopes\TenantScope;
use App\Models\Scopes\TenantRelationScope;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('parent can create a child and wallets are auto-created', function () {
    ['user' => $parent, 'profile' => $parentProfile, 'tenant' => $tenant] = $this->createUserInTenant();
    $household = Household::factory()->create(['tenant_id' => $tenant->id]);
    $parentProfile->update(['household_id' => $household->id]);
    $parent->assignRole('parent');

    $response = $this->actingAsInTenant($parent, $tenant)->postJson('/api/v1/children', [
        'display_name' => 'Little One',
        'username'     => 'little_one',
        'pin'          => '1234',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('data.nickname', null);

    $profileId = $response->json('data.profile_id');
    $childProfile = Profile::withoutGlobalScope(TenantScope::class)->find($profileId);
    expect($childProfile)->not->toBeNull();

    $wallets = Wallet::withoutGlobalScope(TenantRelationScope::class)
        ->where('profile_id', $childProfile->id)->get();
    expect($wallets)->toHaveCount(2);
    expect($wallets->pluck('wallet_type')->sort()->values()->toArray())->toBe(['real', 'virtual']);
});

it('response never includes date_of_birth or pin_hash', function () {
    ['user' => $parent, 'profile' => $parentProfile, 'tenant' => $tenant] = $this->createUserInTenant();
    $parent->assignRole('parent');

    $response = $this->actingAsInTenant($parent, $tenant)->postJson('/api/v1/children', [
        'display_name'  => 'Secret Child',
        'pin'           => '9999',
        'date_of_birth' => '2015-06-15',
    ]);

    $response->assertStatus(201);

    $body = $response->json();
    $flat = json_encode($body);

    expect($flat)->not->toContain('date_of_birth')
                 ->not->toContain('pin_hash')
                 ->not->toContain('2015-06-15');
});

it('child profile cannot be accessed by non-household user', function () {
    // Parent creates child in tenant
    ['user' => $parent, 'profile' => $parentProfile, 'tenant' => $tenant] = $this->createUserInTenant();
    $household = Household::factory()->create(['tenant_id' => $tenant->id]);
    $parentProfile->update(['household_id' => $household->id]);
    $parent->assignRole('parent');

    $childService = app(\App\Services\ChildService::class);
    $child = $childService->create(
        ['display_name' => 'Test Child', 'pin' => '1234'],
        $parentProfile->fresh()
    );

    // Outsider is in the same tenant but has no household
    ['user' => $outsider] = $this->createUserInTenant($tenant);
    $outsider->assignRole('parent');

    $this->actingAsInTenant($outsider, $tenant)
         ->getJson('/api/v1/children/' . $child->id)
         ->assertStatus(403);
});


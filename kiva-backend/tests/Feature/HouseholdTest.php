<?php

use App\Models\Household;
use App\Models\HouseholdGuardian;
use App\Models\FamilyInviteCode;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('parent can create a household', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();
    $user->assignRole('parent');

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/households', ['name' => 'Smith Family'])
         ->assertStatus(201)
         ->assertJsonPath('data.name', 'Smith Family')
         ->assertJsonPath('data.tenant_id', $tenant->id);
});

it('user can view their household', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();
    $household = Household::factory()->create(['tenant_id' => $tenant->id]);
    $profile->update(['household_id' => $household->id]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/households/' . $household->id)
         ->assertStatus(200)
         ->assertJsonPath('data.id', $household->id);
});

it('outsider from different tenant cannot view household (403)', function () {
    ['tenant' => $tenantA] = $this->createUserInTenant();
    $household = Household::factory()->create(['tenant_id' => $tenantA->id]);

    // userB belongs to tenantB, but passes tenantA header → AssertTenantOwnership blocks
    ['user' => $userB, 'tenant' => $tenantB] = $this->createUserInTenant();

    $this->actingAs($userB)
         ->withHeaders(['X-Tenant-ID' => $tenantA->id])
         ->getJson('/api/v1/households/' . $household->id)
         ->assertStatus(403);
});

it('can list household members', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();
    $household = Household::factory()->create(['tenant_id' => $tenant->id]);
    $profile->update(['household_id' => $household->id]);

    HouseholdGuardian::create([
        'household_id'     => $household->id,
        'profile_id'       => $profile->id,
        'role'             => 'admin',
        'permission_level' => 'full',
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/households/' . $household->id . '/members')
         ->assertStatus(200)
         ->assertJsonStructure(['data', 'meta' => ['total', 'per_page', 'current_page', 'last_page']]);
});

it('can generate invite code for a household', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();
    $household = Household::factory()->create(['tenant_id' => $tenant->id]);
    $profile->update(['household_id' => $household->id]);

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/households/' . $household->id . '/invite')
         ->assertStatus(201)
         ->assertJsonStructure(['data' => ['code', 'household_id', 'status', 'expires_at']]);
});

it('can join a household with a valid invite code', function () {
    ['user' => $owner, 'profile' => $ownerProfile, 'tenant' => $tenant] = $this->createUserInTenant();
    $household = Household::factory()->create(['tenant_id' => $tenant->id]);
    $ownerProfile->update(['household_id' => $household->id]);

    FamilyInviteCode::create([
        'household_id' => $household->id,
        'created_by'   => $ownerProfile->id,
        'code'         => 'JOINTEST1',
        'status'       => 'active',
        'expires_at'   => now()->addDays(7),
    ]);

    ['user' => $joiner] = $this->createUserInTenant($tenant);

    $this->actingAsInTenant($joiner, $tenant)
         ->postJson('/api/v1/households/join', ['code' => 'JOINTEST1'])
         ->assertStatus(200)
         ->assertJsonPath('data.id', $household->id);
});

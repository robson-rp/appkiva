<?php

use App\Models\Tenant;
use App\Models\User;
use App\Models\Profile;
use App\Models\Household;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('authenticated request without X-Tenant-ID returns 401', function () {
    $user = User::factory()->create();
    Profile::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
         ->getJson('/api/v1/auth/me')
         ->assertStatus(401)
         ->assertJsonPath('message', 'Tenant not resolved.');
});

it('authenticated request with invalid X-Tenant-ID returns 401', function () {
    $user = User::factory()->create();
    Profile::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
         ->withHeaders(['X-Tenant-ID' => '00000000-0000-0000-0000-000000000000'])
         ->getJson('/api/v1/auth/me')
         ->assertStatus(401);
});

it('authenticated request with inactive tenant returns 401', function () {
    $tenant = Tenant::factory()->inactive()->create();
    $user   = User::factory()->create();
    Profile::factory()->create(['user_id' => $user->id, 'tenant_id' => $tenant->id]);

    $this->actingAs($user)
         ->withHeaders(['X-Tenant-ID' => $tenant->id])
         ->getJson('/api/v1/auth/me')
         ->assertStatus(401);
});

it('user from tenant A cannot access routes with tenant B header (403)', function () {
    ['user' => $userA, 'tenant' => $tenantA] = $this->createUserInTenant();
    ['tenant' => $tenantB]                   = $this->createUserInTenant();

    // userA's profile belongs to tenantA, but header says tenantB → 403
    $this->actingAs($userA)
         ->withHeaders(['X-Tenant-ID' => $tenantB->id])
         ->getJson('/api/v1/auth/me')
         ->assertStatus(403)
         ->assertJsonPath('message', 'Forbidden: user does not belong to this tenant.');
});

it('valid tenant with matching user profile returns 200', function () {
    ['user' => $user, 'tenant' => $tenant] = $this->createUserInTenant();

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/auth/me')
         ->assertStatus(200);
});

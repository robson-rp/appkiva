<?php

use App\Models\PartnerProgram;
use App\Models\ProgramInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can list partner programs via /api/v1/partner-programs', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    PartnerProgram::create([
        'program_name'      => 'School Partners',
        'partner_tenant_id' => $tenant->id,
        'started_at'        => now(),
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/partner-programs')
         ->assertStatus(200)
         ->assertJsonStructure(['data', 'meta'])
         ->assertJsonCount(1, 'data');
});

it('can create a partner program', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/partner-programs', [
             'program_name' => 'New Partnership',
             'program_type' => 'school',
         ])
         ->assertStatus(201)
         ->assertJsonPath('data.program_name', 'New Partnership')
         ->assertJsonPath('data.partner_tenant_id', $tenant->id);
});

it('can view a partner program', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    $program = PartnerProgram::create([
        'program_name'      => 'Viewable Program',
        'partner_tenant_id' => $tenant->id,
        'started_at'        => now(),
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->getJson('/api/v1/partner-programs/' . $program->id)
         ->assertStatus(200)
         ->assertJsonPath('data.id', $program->id);
});

it('can update a partner program', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    $program = PartnerProgram::create([
        'program_name'      => 'Old Name',
        'partner_tenant_id' => $tenant->id,
        'started_at'        => now(),
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->patchJson('/api/v1/partner-programs/' . $program->id, [
             'program_name' => 'Updated Name',
             'status'       => 'paused',
         ])
         ->assertStatus(200)
         ->assertJsonPath('data.program_name', 'Updated Name')
         ->assertJsonPath('data.status', 'paused');
});

it('can delete a partner program', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    $program = PartnerProgram::create([
        'program_name'      => 'To Be Deleted',
        'partner_tenant_id' => $tenant->id,
        'started_at'        => now(),
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->deleteJson('/api/v1/partner-programs/' . $program->id)
         ->assertStatus(204);

    expect(PartnerProgram::find($program->id))->toBeNull();
});

it('can create an invite for a partner program', function () {
    ['user' => $user, 'profile' => $profile, 'tenant' => $tenant] = $this->createUserInTenant();

    $program = PartnerProgram::create([
        'program_name'      => 'Invite Program',
        'partner_tenant_id' => $tenant->id,
        'started_at'        => now(),
    ]);

    $this->actingAsInTenant($user, $tenant)
         ->postJson('/api/v1/partner-programs/' . $program->id . '/invite', [
             'target_type'  => 'family',
             'expires_days' => 14,
         ])
         ->assertStatus(201)
         ->assertJsonStructure(['data' => ['code', 'program_id', 'expires_at']]);
});

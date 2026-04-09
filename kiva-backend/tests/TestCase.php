<?php

namespace Tests;

use App\Models\Profile;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Spatie\Permission\Models\Role;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRoles();
    }

    protected function seedRoles(): void
    {
        if (!\Illuminate\Support\Facades\Schema::hasTable('roles')) {
            return;
        }
        foreach (['parent', 'child', 'teen', 'teacher', 'admin', 'partner'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'api']);
        }
    }

    /**
     * Act as the given user and automatically send the X-Tenant-ID header for all subsequent requests.
     */
    public function actingAsInTenant(User $user, Tenant $tenant): static
    {
        return $this->actingAs($user)->withHeaders(['X-Tenant-ID' => $tenant->id]);
    }

    /**
     * Create a tenant, a user, and a profile wired together for tenant-aware tests.
     *
     * @return array{user: User, profile: Profile, tenant: Tenant}
     */
    public static function createUserInTenant(?Tenant $tenant = null): array
    {
        $tenant  = $tenant ?? Tenant::factory()->create(['is_active' => true]);
        $user    = User::factory()->create();
        $profile = Profile::factory()->create([
            'user_id'      => $user->id,
            'tenant_id'    => $tenant->id,
            'household_id' => null,
        ]);

        return ['user' => $user, 'profile' => $profile, 'tenant' => $tenant];
    }
}


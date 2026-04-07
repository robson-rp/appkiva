<?php

namespace App\Services;

use App\Models\User;
use App\Models\Profile;
use App\Models\Household;
use App\Models\HouseholdGuardian;
use App\Models\Child;
use App\Models\Wallet;
use App\Models\AllowanceConfig;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'email'    => strip_tags($data['email']),
                'password' => $data['password'],
            ]);

            // Assign role
            $role = $data['role'] ?? 'parent';
            $user->assignRole($role);

            // Create household if parent
            $household = null;
            if ($role === 'parent') {
                $household = Household::create([
                    'name'      => strip_tags($data['household_name'] ?? $data['display_name'] . "'s Family"),
                    'tenant_id' => $data['tenant_id'] ?? null,
                ]);
            }

            $profile = Profile::create([
                'user_id'          => $user->id,
                'display_name'     => strip_tags($data['display_name']),
                'username'         => strip_tags($data['username'] ?? null),
                'language'         => $data['language'] ?? 'pt',
                'country'          => $data['country'] ?? 'PT',
                'household_id'     => $household?->id,
                'tenant_id'        => $data['tenant_id'] ?? null,
                'phone'            => strip_tags($data['phone'] ?? null),
                'gender'           => strip_tags($data['gender'] ?? null),
                'sector'           => strip_tags($data['sector'] ?? null),
                'institution_name' => strip_tags($data['institution_name'] ?? null),
            ]);

            if ($household) {
                HouseholdGuardian::create([
                    'household_id'     => $household->id,
                    'profile_id'       => $profile->id,
                    'role'             => 'owner',
                    'permission_level' => 'full',
                ]);
            }

            $token = JWTAuth::fromUser($user);

            return [
                'user'    => $user,
                'profile' => $profile,
                'token'   => $token,
            ];
        });
    }

    public function login(string $email, string $password): ?array
    {
        $token = JWTAuth::attempt(['email' => $email, 'password' => $password]);

        if (!$token) {
            return null;
        }

        $user = JWTAuth::user();

        if (!$user->is_active) {
            return null;
        }

        $refreshToken = JWTAuth::claims(['type' => 'refresh'])->fromUser($user);

        return [
            'token'         => $token,
            'refresh_token' => $refreshToken,
            'user'          => $user,
        ];
    }

    public function childLogin(string $username, string $pin, string $householdId): ?array
    {
        $child = Child::where('username', $username)->first();

        if (!$child || !Hash::check($pin, $child->pin_hash)) {
            return null;
        }

        // Verify child belongs to household
        $profile = $child->profile;
        if ($profile->household_id !== $householdId) {
            return null;
        }

        $user = $profile->user;

        if (!$user || !$user->is_active) {
            return null;
        }

        $token = JWTAuth::claims(['exp' => now()->addDay()->timestamp])->fromUser($user);

        return [
            'token'   => $token,
            'user'    => $user,
            'profile' => $profile,
        ];
    }

    public function logout(): void
    {
        JWTAuth::invalidate(JWTAuth::getToken());
    }

    public function refresh(string $refreshToken): ?string
    {
        try {
            JWTAuth::setToken($refreshToken);
            return JWTAuth::refresh();
        } catch (\Throwable) {
            return null;
        }
    }
}

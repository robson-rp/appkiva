<?php

namespace App\Services;

use App\Models\Child;
use App\Models\Profile;
use App\Models\User;
use App\Models\Wallet;
use App\Models\AllowanceConfig;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ChildService
{
    public function create(array $data, Profile $parentProfile): Child
    {
        return DB::transaction(function () use ($data, $parentProfile) {
            // Create user account for child
            $user = User::create([
                'email'    => $data['email'] ?? Str::uuid() . '@child.kivara.internal',
                'password' => Hash::make(Str::random(32)),
            ]);

            $dob = isset($data['date_of_birth']) ? Carbon::parse($data['date_of_birth']) : null;
            $age = $dob ? $dob->age : 10;
            $role = $age >= 13 ? 'teen' : 'child';
            $user->assignRole($role);

            $childProfile = Profile::create([
                'user_id'      => $user->id,
                'display_name' => strip_tags($data['display_name']),
                'username'     => strip_tags($data['username'] ?? null),
                'household_id' => $parentProfile->household_id,
                'tenant_id'    => $parentProfile->tenant_id,
                'language'     => $data['language'] ?? 'pt',
                'country'      => $data['country'] ?? 'PT',
            ]);

            $child = Child::create([
                'profile_id'        => $childProfile->id,
                'parent_profile_id' => $parentProfile->id,
                'nickname'          => strip_tags($data['nickname'] ?? null),
                'username'          => strip_tags($data['username'] ?? null),
                'pin_hash'          => isset($data['pin']) ? Hash::make($data['pin']) : null,
                'date_of_birth'     => $dob,
                'daily_spend_limit' => $data['daily_spend_limit'] ?? null,
                'monthly_budget'    => $data['monthly_budget'] ?? null,
                'school_tenant_id'  => $data['school_tenant_id'] ?? null,
            ]);

            // Create default wallets (virtual + real)
            Wallet::create([
                'profile_id'  => $childProfile->id,
                'wallet_type' => 'virtual',
                'currency'    => $data['currency'] ?? 'EUR',
            ]);

            Wallet::create([
                'profile_id'  => $childProfile->id,
                'wallet_type' => 'real',
                'currency'    => $data['currency'] ?? 'EUR',
            ]);

            // Create default allowance config
            AllowanceConfig::create([
                'child_profile_id'  => $childProfile->id,
                'parent_profile_id' => $parentProfile->id,
                'base_amount'       => 0,
                'frequency'         => 'weekly',
            ]);

            return $child->load('profile');
        });
    }
}

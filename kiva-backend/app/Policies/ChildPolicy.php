<?php

namespace App\Policies;

use App\Models\Child;
use App\Models\Profile;
use App\Models\User;

class ChildPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['parent', 'admin']);
    }

    public function view(User $user, Child $child): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        $profile = $user->profile;

        return $profile && (
            $child->parent_profile_id === $profile->id ||
            $child->profile?->household_id === $profile->household_id
        );
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['parent', 'admin']);
    }

    public function update(User $user, Child $child): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->profile?->id === $child->parent_profile_id;
    }

    public function delete(User $user, Child $child): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->profile?->id === $child->parent_profile_id;
    }
}

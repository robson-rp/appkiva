<?php

namespace App\Policies;

use App\Models\Wallet;
use App\Models\User;

class WalletPolicy
{
    public function view(User $user, Wallet $wallet): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        $profile = $user->profile;
        if (!$profile) {
            return false;
        }

        // Owner
        if ($wallet->profile_id === $profile->id) {
            return true;
        }

        // Parent viewing child wallet in same household
        $walletProfile = $wallet->profile;

        return $walletProfile &&
               $walletProfile->household_id === $profile->household_id &&
               $user->hasRole('parent');
    }

    public function update(User $user, Wallet $wallet): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        // Parents can freeze/unfreeze wallets of children in their household
        $profile = $user->profile;
        $walletProfile = $wallet->profile;

        return $walletProfile &&
               $walletProfile->household_id === $profile?->household_id &&
               $user->hasRole('parent');
    }
}

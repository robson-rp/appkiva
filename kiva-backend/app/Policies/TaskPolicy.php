<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function view(User $user, Task $task): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        $profile = $user->profile;

        return $profile && (
            $task->child_profile_id === $profile->id ||
            $task->parent_profile_id === $profile->id ||
            $task->household_id === $profile->household_id
        );
    }

    public function update(User $user, Task $task): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        $profile = $user->profile;

        return $profile && (
            $task->child_profile_id === $profile->id ||
            $task->parent_profile_id === $profile->id
        );
    }

    public function delete(User $user, Task $task): bool
    {
        return $this->update($user, $task);
    }

    public function approve(User $user, Task $task): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->profile?->id === $task->parent_profile_id;
    }
}

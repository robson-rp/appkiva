<?php

namespace App\Listeners;

use App\Events\TaskApproved;
use App\Jobs\CheckBadgeUnlockJob;
use Illuminate\Contracts\Queue\ShouldQueue;

class CreditRewardToWallet implements ShouldQueue
{
    public function handle(TaskApproved $event): void
    {
        // Reward is already credited in TaskService::approve()
        // This listener handles any additional post-approval logic
        CheckBadgeUnlockJob::dispatch($event->task->child_profile_id);
    }
}

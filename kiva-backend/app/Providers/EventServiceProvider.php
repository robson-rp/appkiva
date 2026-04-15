<?php

namespace App\Providers;

use App\Events\LessonCompleted;
use App\Events\MissionCompleted;
use App\Events\RiskFlagCreated;
use App\Events\TaskApproved;
use App\Events\WalletTransfer;
use App\Listeners\CreditRewardToWallet;
use App\Listeners\HandleRiskFlagCreated;
use App\Listeners\LogAuditEntry;
use App\Models\Child;
use App\Models\Profile;
use App\Models\Task;
use App\Models\Tenant;
use App\Models\UserRole;
use App\Models\Wallet;
use App\Observers\ProfileObserver;
use App\Observers\TenantObserver;
use App\Observers\UserRoleObserver;
use App\Policies\ChildPolicy;
use App\Policies\TaskPolicy;
use App\Policies\WalletPolicy;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        TaskApproved::class => [
            CreditRewardToWallet::class,
        ],

        WalletTransfer::class => [
            LogAuditEntry::class,
        ],

        RiskFlagCreated::class => [
            HandleRiskFlagCreated::class,
        ],
    ];

    public function boot(): void
    {
        Gate::policy(Child::class, ChildPolicy::class);
        Gate::policy(Task::class, TaskPolicy::class);
        Gate::policy(Wallet::class, WalletPolicy::class);

        Tenant::observe(TenantObserver::class);
        Profile::observe(ProfileObserver::class);
        UserRole::observe(UserRoleObserver::class);
    }
}

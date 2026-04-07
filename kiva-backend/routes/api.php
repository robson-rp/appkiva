<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ChildController;
use App\Http\Controllers\Api\V1\WalletController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Auth (public)
    Route::post('/auth/register',        [AuthController::class, 'register']);
    Route::post('/auth/login',           [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('/auth/child-login',     [AuthController::class, 'childLogin'])->middleware('throttle:child-login');
    Route::post('/auth/refresh',         [AuthController::class, 'refresh']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password',  [AuthController::class, 'resetPassword']);

    // Authenticated routes
    Route::middleware(['auth:api', 'role.rate'])->group(function () {

        // Auth self
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me',      [AuthController::class, 'me']);
        Route::patch('/auth/me',    [AuthController::class, 'updateMe']);

        // Profiles
        Route::get('/profiles/{id}',   [\App\Http\Controllers\Api\V1\ProfileController::class, 'show'])->whereUuid('id');
        Route::patch('/profiles/{id}', [\App\Http\Controllers\Api\V1\ProfileController::class, 'update'])->whereUuid('id');

        // Households
        Route::apiResource('households', \App\Http\Controllers\Api\V1\HouseholdController::class)->except(['index']);
        Route::get('/households/{household}/guardians', [\App\Http\Controllers\Api\V1\HouseholdController::class, 'guardians']);
        Route::post('/households/{household}/invite',   [\App\Http\Controllers\Api\V1\HouseholdController::class, 'generateInvite']);
        Route::post('/invite/accept/{code}',            [\App\Http\Controllers\Api\V1\HouseholdController::class, 'acceptInvite']);

        // Children
        Route::apiResource('children', ChildController::class);

        // Tasks
        Route::apiResource('tasks', \App\Http\Controllers\Api\V1\TaskController::class);
        Route::post('/tasks/{task}/approve', [\App\Http\Controllers\Api\V1\TaskController::class, 'approve'])->whereUuid('task');
        Route::post('/tasks/{task}/reject',  [\App\Http\Controllers\Api\V1\TaskController::class, 'reject'])->whereUuid('task');
        Route::post('/tasks/{task}/complete',[\App\Http\Controllers\Api\V1\TaskController::class, 'complete'])->whereUuid('task');

        // Missions
        Route::apiResource('missions', \App\Http\Controllers\Api\V1\MissionController::class);
        Route::post('/missions/{mission}/complete', [\App\Http\Controllers\Api\V1\MissionController::class, 'complete'])->whereUuid('mission');
        Route::get('/mission-templates',            [\App\Http\Controllers\Api\V1\MissionController::class, 'templates']);
        Route::post('/mission-templates',           [\App\Http\Controllers\Api\V1\MissionController::class, 'storeTemplate']);

        // Wallets
        Route::get('/wallet',                    [WalletController::class, 'index']);
        Route::get('/wallet/{id}',               [WalletController::class, 'show'])->whereUuid('id');
        Route::get('/wallet/{id}/transactions',  [WalletController::class, 'transactions'])->whereUuid('id');
        Route::post('/wallet/transactions',      [WalletController::class, 'createTransaction']);
        Route::post('/wallet/{id}/freeze',       [WalletController::class, 'freeze'])->whereUuid('id');
        Route::post('/wallet/{id}/unfreeze',     [WalletController::class, 'unfreeze'])->whereUuid('id');

        // Budget exceptions
        Route::get('/wallet/budget-exceptions',       [\App\Http\Controllers\Api\V1\BudgetExceptionController::class, 'index']);
        Route::post('/wallet/budget-exceptions',      [\App\Http\Controllers\Api\V1\BudgetExceptionController::class, 'store']);
        Route::patch('/wallet/budget-exceptions/{id}',[\App\Http\Controllers\Api\V1\BudgetExceptionController::class, 'resolve'])->whereUuid('id');

        // Rewards
        Route::apiResource('rewards', \App\Http\Controllers\Api\V1\RewardController::class);
        Route::post('/rewards/{reward}/claim', [\App\Http\Controllers\Api\V1\RewardController::class, 'claim'])->whereUuid('reward');

        // Vaults
        Route::apiResource('vaults', \App\Http\Controllers\Api\V1\VaultController::class);
        Route::post('/vaults/{vault}/deposit',  [\App\Http\Controllers\Api\V1\VaultController::class, 'deposit'])->whereUuid('vault');
        Route::post('/vaults/{vault}/withdraw', [\App\Http\Controllers\Api\V1\VaultController::class, 'withdraw'])->whereUuid('vault');

        Route::apiResource('dream-vaults', \App\Http\Controllers\Api\V1\DreamVaultController::class);
        Route::post('/dream-vaults/{vault}/contribute', [\App\Http\Controllers\Api\V1\DreamVaultController::class, 'contribute'])->whereUuid('vault');
        Route::get('/dream-vaults/{vault}/comments',    [\App\Http\Controllers\Api\V1\DreamVaultController::class, 'comments'])->whereUuid('vault');
        Route::post('/dream-vaults/{vault}/comments',   [\App\Http\Controllers\Api\V1\DreamVaultController::class, 'addComment'])->whereUuid('vault');

        // Allowances
        Route::apiResource('allowances', \App\Http\Controllers\Api\V1\AllowanceController::class);
        Route::post('/allowances/process', [\App\Http\Controllers\Api\V1\AllowanceController::class, 'process']);

        // Education
        Route::apiResource('lessons', \App\Http\Controllers\Api\V1\LessonController::class);
        Route::get('/lessons/{lesson}/progress',  [\App\Http\Controllers\Api\V1\LessonController::class, 'getProgress'])->whereUuid('lesson');
        Route::post('/lessons/{lesson}/progress', [\App\Http\Controllers\Api\V1\LessonController::class, 'recordProgress'])->whereUuid('lesson');

        // Gamification
        Route::get('/badges',           [\App\Http\Controllers\Api\V1\GamificationController::class, 'badges']);
        Route::get('/badges/progress',  [\App\Http\Controllers\Api\V1\GamificationController::class, 'badgeProgress']);
        Route::get('/streaks',          [\App\Http\Controllers\Api\V1\GamificationController::class, 'streaks']);
        Route::post('/streaks/activity',[\App\Http\Controllers\Api\V1\GamificationController::class, 'recordActivity']);
        Route::get('/kiva-points',      [\App\Http\Controllers\Api\V1\GamificationController::class, 'kivaPoints']);
        Route::get('/leaderboard/household', [\App\Http\Controllers\Api\V1\GamificationController::class, 'householdLeaderboard']);

        // Notifications
        Route::get('/notifications',                    [\App\Http\Controllers\Api\V1\NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read',        [\App\Http\Controllers\Api\V1\NotificationController::class, 'markRead'])->whereUuid('id');
        Route::post('/notifications/mark-all-read',     [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAllRead']);
        Route::delete('/notifications/{id}',            [\App\Http\Controllers\Api\V1\NotificationController::class, 'destroy'])->whereUuid('id');

        // School
        Route::get('/classrooms',                               [\App\Http\Controllers\Api\V1\SchoolController::class, 'indexClassrooms']);
        Route::post('/classrooms',                              [\App\Http\Controllers\Api\V1\SchoolController::class, 'storeClassroom']);
        Route::get('/classrooms/{id}',                          [\App\Http\Controllers\Api\V1\SchoolController::class, 'showClassroom'])->whereUuid('id');
        Route::patch('/classrooms/{id}',                        [\App\Http\Controllers\Api\V1\SchoolController::class, 'updateClassroom'])->whereUuid('id');
        Route::delete('/classrooms/{id}',                       [\App\Http\Controllers\Api\V1\SchoolController::class, 'destroyClassroom'])->whereUuid('id');
        Route::get('/classrooms/{id}/students',                 [\App\Http\Controllers\Api\V1\SchoolController::class, 'students'])->whereUuid('id');
        Route::post('/classrooms/{id}/students/{childId}',      [\App\Http\Controllers\Api\V1\SchoolController::class, 'addStudent']);
        Route::delete('/classrooms/{id}/students/{childId}',    [\App\Http\Controllers\Api\V1\SchoolController::class, 'removeStudent']);
        Route::get('/school/students',                          [\App\Http\Controllers\Api\V1\SchoolController::class, 'schoolStudents']);

        // Challenges
        Route::get('/challenges/weekly',     [\App\Http\Controllers\Api\V1\ChallengeController::class, 'weekly']);
        Route::get('/challenges/collective', [\App\Http\Controllers\Api\V1\ChallengeController::class, 'collective']);
        Route::post('/challenges/collective',[\App\Http\Controllers\Api\V1\ChallengeController::class, 'storeCollective']);
        Route::post('/challenges/{id}/complete', [\App\Http\Controllers\Api\V1\ChallengeController::class, 'complete'])->whereUuid('id');

        // Donations
        Route::get('/donations/causes',         [\App\Http\Controllers\Api\V1\DonationController::class, 'causes']);
        Route::post('/donations',               [\App\Http\Controllers\Api\V1\DonationController::class, 'donate']);
        Route::get('/donations',                [\App\Http\Controllers\Api\V1\DonationController::class, 'myDonations']);

        // Diary
        Route::apiResource('diary', \App\Http\Controllers\Api\V1\DiaryController::class);

        // Tenants & Subscriptions
        Route::get('/subscription',          [\App\Http\Controllers\Api\V1\SubscriptionController::class, 'current']);
        Route::get('/subscription/tiers',    [\App\Http\Controllers\Api\V1\SubscriptionController::class, 'tiers']);
        Route::get('/subscription/invoices', [\App\Http\Controllers\Api\V1\SubscriptionController::class, 'invoices']);

        // Programs
        Route::apiResource('programs', \App\Http\Controllers\Api\V1\ProgramController::class);
        Route::get('/programs/{id}/invitations', [\App\Http\Controllers\Api\V1\ProgramController::class, 'invitations'])->whereUuid('id');
        Route::post('/programs/{id}/invite',     [\App\Http\Controllers\Api\V1\ProgramController::class, 'invite'])->whereUuid('id');
        Route::post('/invite/program/{code}',    [\App\Http\Controllers\Api\V1\ProgramController::class, 'acceptInvite']);

        // Admin
        Route::prefix('admin')->middleware('role:admin')->group(function () {
            Route::get('/stats',                          [\App\Http\Controllers\Api\V1\AdminController::class, 'stats']);
            Route::get('/users',                          [\App\Http\Controllers\Api\V1\AdminController::class, 'users']);
            Route::get('/audit-log',                      [\App\Http\Controllers\Api\V1\AdminController::class, 'auditLog']);
            Route::get('/risk-flags',                     [\App\Http\Controllers\Api\V1\AdminController::class, 'riskFlags']);
            Route::patch('/risk-flags/{id}',              [\App\Http\Controllers\Api\V1\AdminController::class, 'resolveRiskFlag'])->whereUuid('id');
            Route::get('/currencies',                     [\App\Http\Controllers\Api\V1\AdminController::class, 'currencies']);
            Route::post('/currencies',                    [\App\Http\Controllers\Api\V1\AdminController::class, 'storeCurrency']);
            Route::get('/tenants',                        [\App\Http\Controllers\Api\V1\AdminController::class, 'tenants']);
            Route::post('/tenants',                       [\App\Http\Controllers\Api\V1\AdminController::class, 'storeTenant']);
            Route::patch('/tenants/{id}',                 [\App\Http\Controllers\Api\V1\AdminController::class, 'updateTenant'])->whereUuid('id');
            Route::delete('/tenants/{id}',                [\App\Http\Controllers\Api\V1\AdminController::class, 'destroyTenant'])->whereUuid('id');
        });
    });
});

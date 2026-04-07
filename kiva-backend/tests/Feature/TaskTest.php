<?php

use App\Models\User;
use App\Models\Profile;
use App\Models\Task;
use App\Models\Wallet;
use App\Models\LedgerEntry;
use App\Services\TaskService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('approving a task sets status to approved and credits wallet', function () {
    $parent = User::factory()->create();
    $parentProfile = Profile::factory()->create(['user_id' => $parent->id]);
    $parent->assignRole('parent');

    $childProfile = Profile::factory()->create();
    $wallet = Wallet::factory()->create([
        'profile_id'  => $childProfile->id,
        'wallet_type' => 'virtual',
        'is_active'   => true,
    ]);

    $task = Task::factory()->create([
        'child_profile_id'  => $childProfile->id,
        'parent_profile_id' => $parentProfile->id,
        'reward'            => '5.0000',
        'status'            => 'completed',
    ]);

    $service = app(TaskService::class);
    $service->approve($task, $parentProfile->id);

    expect($task->fresh()->status)->toBe('approved');

    $entry = LedgerEntry::where('credit_wallet_id', $wallet->id)
        ->where('entry_type', 'task_reward')
        ->where('reference_id', $task->id)
        ->first();

    expect($entry)->not->toBeNull();
    expect((float) $entry->amount)->toBe(5.0);
});

it('cannot approve an already approved task', function () {
    $parentProfile = Profile::factory()->create();
    $task = Task::factory()->create(['status' => 'approved']);

    $service = app(TaskService::class);

    expect(fn() => $service->approve($task, $parentProfile->id))
        ->toThrow(\RuntimeException::class, 'already approved');
});

it('task reward idempotency_key prevents double credit', function () {
    $parentProfile = Profile::factory()->create();
    $childProfile  = Profile::factory()->create();
    $wallet = Wallet::factory()->create([
        'profile_id'  => $childProfile->id,
        'wallet_type' => 'virtual',
        'is_active'   => true,
    ]);

    $task = Task::factory()->create([
        'child_profile_id'  => $childProfile->id,
        'parent_profile_id' => $parentProfile->id,
        'reward'            => '10.0000',
        'status'            => 'completed',
    ]);

    // Pre-seed the idempotency key as if it was already processed
    LedgerEntry::create([
        'credit_wallet_id' => $wallet->id,
        'amount'           => '10.0000',
        'entry_type'       => 'task_reward',
        'idempotency_key'  => 'task_reward_' . $task->id,
        'reference_id'     => $task->id,
        'reference_type'   => 'task',
    ]);

    $service = app(TaskService::class);
    $service->approve($task, $parentProfile->id);

    expect(
        LedgerEntry::where('idempotency_key', 'task_reward_' . $task->id)->count()
    )->toBe(1);
});

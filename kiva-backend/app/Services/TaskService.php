<?php

namespace App\Services;

use App\Events\TaskApproved;
use App\Models\LedgerEntry;
use App\Models\Task;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class TaskService
{
    public function approve(Task $task, string $approvedByProfileId): Task
    {
        return DB::transaction(function () use ($task, $approvedByProfileId) {
            if ($task->status === 'approved') {
                throw new \RuntimeException('Task is already approved.');
            }

            $task->update([
                'status'      => 'approved',
                'approved_at' => now(),
                'approved_by' => $approvedByProfileId,
            ]);

            // Credit reward to child's virtual wallet
            if ($task->reward > 0) {
                $wallet = Wallet::where('profile_id', $task->child_profile_id)
                    ->where('wallet_type', 'virtual')
                    ->where('is_active', true)
                    ->first();

                if ($wallet) {
                    LedgerEntry::create([
                        'credit_wallet_id' => $wallet->id,
                        'debit_wallet_id'  => null,
                        'amount'           => $task->reward,
                        'entry_type'       => 'task_reward',
                        'description'      => 'Reward for task: ' . $task->title,
                        'created_by'       => $approvedByProfileId,
                        'approved_by'      => $approvedByProfileId,
                        'approved_at'      => now(),
                        'reference_id'     => $task->id,
                        'reference_type'   => 'task',
                        'idempotency_key'  => 'task_reward_' . $task->id,
                    ]);
                }
            }

            event(new TaskApproved($task));

            return $task->fresh();
        });
    }
}

<?php

namespace App\Jobs;

use App\Models\Streak;
use App\Models\StreakActivity;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CalculateStreakJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly string $profileId) {}

    public function handle(): void
    {
        $streak = Streak::firstOrCreate(
            ['profile_id' => $this->profileId],
            ['current_streak' => 0, 'longest_streak' => 0, 'total_active_days' => 0]
        );

        $today = now()->toDateString();

        if ($streak->last_active_date?->toDateString() === $today) {
            return;
        }

        $yesterday = now()->subDay()->toDateString();
        $isConsecutive = $streak->last_active_date?->toDateString() === $yesterday;

        $newStreak = $isConsecutive ? $streak->current_streak + 1 : 1;

        $streak->update([
            'current_streak'    => $newStreak,
            'longest_streak'    => max($streak->longest_streak, $newStreak),
            'last_active_date'  => $today,
            'total_active_days' => $streak->total_active_days + 1,
        ]);
    }
}

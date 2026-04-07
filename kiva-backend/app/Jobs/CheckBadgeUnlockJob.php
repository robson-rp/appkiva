<?php

namespace App\Jobs;

use App\Models\Profile;
use App\Models\Badge;
use App\Models\BadgeProgress;
use App\Models\Task;
use App\Models\Streak;
use App\Models\LessonProgress;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CheckBadgeUnlockJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly string $profileId) {}

    public function handle(): void
    {
        $profile = Profile::find($this->profileId);
        if (!$profile) {
            return;
        }

        $badges = Badge::where('is_active', true)
            ->whereNotNull('unlock_condition')
            ->get();

        foreach ($badges as $badge) {
            if (BadgeProgress::where('badge_id', $badge->id)->where('profile_id', $this->profileId)->exists()) {
                continue;
            }

            if ($this->meetsCondition($profile, $badge->unlock_condition)) {
                BadgeProgress::create([
                    'badge_id'    => $badge->id,
                    'profile_id'  => $this->profileId,
                    'unlocked_at' => now(),
                ]);
            }
        }
    }

    protected function meetsCondition(Profile $profile, array $condition): bool
    {
        return match ($condition['type'] ?? '') {
            'task_count' => Task::where('child_profile_id', $profile->id)
                ->where('status', 'approved')
                ->count() >= ($condition['value'] ?? 0),

            'streak_days' => (Streak::where('profile_id', $profile->id)->first()?->current_streak ?? 0)
                >= ($condition['value'] ?? 0),

            'missions_completed' => \App\Models\Mission::where('child_profile_id', $profile->id)
                ->where('status', 'completed')
                ->count() >= ($condition['value'] ?? 0),

            default => false,
        };
    }
}

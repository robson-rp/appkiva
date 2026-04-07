<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\BadgeProgress;
use App\Models\Streak;
use App\Models\LessonProgress;
use App\Models\Task;
use App\Models\Mission;
use App\Jobs\CalculateStreakJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GamificationController extends Controller
{
    public function badges(Request $request): JsonResponse
    {
        $badges = Badge::where('is_active', true)->orderBy('sort_order')->get();

        return response()->json(['data' => $badges]);
    }

    public function badgeProgress(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $progress = BadgeProgress::with('badge')
            ->where('profile_id', $profile->id)
            ->get();

        return response()->json(['data' => $progress]);
    }

    public function streaks(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $streak = Streak::firstOrCreate(
            ['profile_id' => $profile->id],
            ['current_streak' => 0, 'longest_streak' => 0, 'total_active_days' => 0]
        );

        return response()->json(['data' => $streak]);
    }

    public function recordActivity(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        CalculateStreakJob::dispatch($profile->id);

        return response()->json(['message' => 'Activity recorded.']);
    }

    public function kivaPoints(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $points = LessonProgress::where('profile_id', $profile->id)
            ->sum('kiva_points_earned');

        $points += Mission::where('child_profile_id', $profile->id)
            ->where('status', 'completed')
            ->sum('kiva_points_reward');

        return response()->json(['data' => ['kiva_points' => (int) $points]]);
    }

    public function householdLeaderboard(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        if (!$profile->household_id) {
            return response()->json(['data' => []]);
        }

        $leaderboard = DB::table('profiles')
            ->where('household_id', $profile->household_id)
            ->join('children', 'children.profile_id', '=', 'profiles.id')
            ->leftJoin('lesson_progress', 'lesson_progress.profile_id', '=', 'profiles.id')
            ->leftJoin('missions', function ($join) {
                $join->on('missions.child_profile_id', '=', 'profiles.id')
                     ->where('missions.status', 'completed');
            })
            ->select(
                'profiles.id',
                'profiles.display_name',
                'profiles.avatar',
                DB::raw('COALESCE(SUM(lesson_progress.kiva_points_earned), 0) + COALESCE(SUM(missions.kiva_points_reward), 0) AS total_points')
            )
            ->groupBy('profiles.id', 'profiles.display_name', 'profiles.avatar')
            ->orderByDesc('total_points')
            ->get();

        return response()->json(['data' => $leaderboard]);
    }
}

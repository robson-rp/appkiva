<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OnboardingAnalytic;
use App\Models\OnboardingProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    /** GET /onboarding/progress */
    public function getProgress(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $progress = OnboardingProgress::firstOrCreate(
            ['profile_id' => $profile->id],
            ['current_step' => 0, 'completed' => false, 'skipped' => false]
        );

        return response()->json(['data' => [
            'profile_id'   => $progress->profile_id,
            'current_step' => $progress->current_step,
            'completed'    => $progress->completed,
            'skipped'      => $progress->skipped,
            'completed_at' => $progress->completed_at,
        ]]);
    }

    /** POST /onboarding/progress */
    public function upsertProgress(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_step' => 'sometimes|integer|min:0',
            'completed'    => 'sometimes|boolean',
            'skipped'      => 'sometimes|boolean',
            'completed_at' => 'sometimes|nullable|date',
        ]);

        $profile = $request->user()->profile;

        $progress = OnboardingProgress::updateOrCreate(
            ['profile_id' => $profile->id],
            $data
        );

        return response()->json(['data' => [
            'profile_id'   => $progress->profile_id,
            'current_step' => $progress->current_step,
            'completed'    => $progress->completed,
            'skipped'      => $progress->skipped,
            'completed_at' => $progress->completed_at,
        ]]);
    }

    /** POST /onboarding/track */
    public function trackEvent(Request $request): JsonResponse
    {
        $data = $request->validate([
            'event_type' => 'required|string|in:view,complete,skip',
            'step_index' => 'required|integer|min:0',
            'role'       => 'sometimes|string|max:30',
            'metadata'   => 'sometimes|array',
        ]);

        $profile = $request->user()->profile;

        OnboardingAnalytic::create([
            'profile_id' => $profile->id,
            'event_type' => $data['event_type'],
            'step_index' => $data['step_index'],
            'role'       => $data['role'] ?? $profile->roles()->first()?->name,
            'metadata'   => $data['metadata'] ?? null,
        ]);

        return response()->json(['data' => ['status' => 'recorded']], 201);
    }
}

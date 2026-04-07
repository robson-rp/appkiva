<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CollectiveChallenge;
use App\Models\WeeklyChallenge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    public function weekly(Request $request): JsonResponse
    {
        $profile    = $request->user()->profile;
        $challenges = WeeklyChallenge::where('profile_id', $profile->id)
            ->where('status', 'active')
            ->get();

        return response()->json(['data' => $challenges]);
    }

    public function collective(Request $request): JsonResponse
    {
        $profile    = $request->user()->profile;
        $challenges = CollectiveChallenge::where('status', 'active')
            ->whereHas('classroom', fn($q) => $q->where('school_tenant_id', $profile->tenant_id))
            ->get();

        return response()->json(['data' => $challenges]);
    }

    public function storeCollective(Request $request): JsonResponse
    {
        $data = $request->validate([
            'classroom_id'       => 'required|uuid|exists:classrooms,id',
            'title'              => 'required|string|max:255',
            'description'        => 'nullable|string|max:1000',
            'type'               => 'nullable|string|max:50',
            'reward'             => 'nullable|numeric|min:0',
            'kiva_points_reward' => 'nullable|integer|min:0',
            'target_amount'      => 'nullable|numeric|min:0',
            'start_date'         => 'nullable|date',
            'end_date'           => 'nullable|date|after_or_equal:start_date',
        ]);

        $data['teacher_profile_id'] = $request->user()->profile->id;

        $challenge = CollectiveChallenge::create($data);

        return response()->json(['data' => $challenge], 201);
    }

    public function complete(Request $request, string $id): JsonResponse
    {
        $challenge = CollectiveChallenge::find($id) ?? WeeklyChallenge::findOrFail($id);

        $challenge->update(['status' => 'completed']);

        return response()->json(['data' => $challenge->fresh()]);
    }
}

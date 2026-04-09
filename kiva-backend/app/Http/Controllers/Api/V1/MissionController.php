<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MissionResource;
use App\Events\MissionCompleted;
use App\Models\Mission;
use App\Models\MissionTemplate;
use App\Models\LedgerEntry;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $missions = Mission::where('child_profile_id', $profile->id)
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => MissionResource::collection($missions->items()),
            'meta' => ['total' => $missions->total(), 'current_page' => $missions->currentPage(), 'last_page' => $missions->lastPage()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $data = $request->validate([
            'child_profile_id' => 'required|uuid|exists:profiles,id',
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string|max:1000',
            'type'             => 'required|in:saving,budgeting,planning,custom,learning,social,goal,daily,weekly',
            'difficulty'       => 'nullable|in:beginner,explorer,saver,strategist,master',
            'reward'           => 'nullable|numeric|min:0',
            'kiva_points_reward' => 'nullable|integer|min:0',
            'target_amount'    => 'nullable|numeric|min:0',
            'expires_at'       => 'nullable|date',
        ]);

        $data['parent_profile_id'] = $profile->id;
        $data['household_id']      = $profile->household_id;
        $data['source']            = 'parent';

        $mission = Mission::create($data);

        return response()->json(['data' => new MissionResource($mission)], 201);
    }

    public function show(Request $request, string $mission): JsonResponse
    {
        $m = Mission::findOrFail($mission);

        return response()->json(['data' => new MissionResource($m)]);
    }

    public function update(Request $request, string $mission): JsonResponse
    {
        $m = Mission::findOrFail($mission);

        $data = $request->validate([
            'title'         => 'nullable|string|max:255',
            'description'   => 'nullable|string|max:1000',
            'status'        => 'nullable|in:available,in_progress,completed',
            'reward'        => 'nullable|numeric|min:0',
            'target_amount' => 'nullable|numeric|min:0',
            'expires_at'    => 'nullable|date',
        ]);

        $m->update($data);

        return response()->json(['data' => new MissionResource($m->fresh())]);
    }

    public function destroy(Request $request, string $mission): JsonResponse
    {
        Mission::findOrFail($mission)->delete();

        return response()->json(null, 204);
    }

    public function complete(Request $request, string $mission): JsonResponse
    {
        $m = Mission::findOrFail($mission);

        if ($m->status === 'completed') {
            return response()->json(['message' => 'Mission already completed.'], 422);
        }

        DB::transaction(function () use ($m) {
            $m->update(['status' => 'completed', 'completed_at' => now()]);

            if ($m->reward > 0) {
                $wallet = Wallet::where('profile_id', $m->child_profile_id)
                    ->where('wallet_type', 'virtual')->where('is_active', true)->first();

                if ($wallet) {
                    LedgerEntry::create([
                        'credit_wallet_id' => $wallet->id,
                        'amount'           => $m->reward,
                        'entry_type'       => 'mission_reward',
                        'description'      => 'Mission reward: ' . $m->title,
                        'reference_id'     => $m->id,
                        'reference_type'   => 'mission',
                        'idempotency_key'  => 'mission_reward_' . $m->id,
                    ]);
                }
            }

            event(new MissionCompleted($m));
        });

        return response()->json(['data' => new MissionResource($m->fresh())]);
    }

    public function start(Request $request, string $mission): JsonResponse
    {
        $m = Mission::findOrFail($mission);

        if ($m->status === 'in_progress') {
            return response()->json(['message' => 'Mission already started.'], 422);
        }

        if ($m->status === 'completed') {
            return response()->json(['message' => 'Mission already completed.'], 422);
        }

        $m->update(['status' => 'in_progress']);

        return response()->json(['data' => new MissionResource($m->fresh())]);
    }

    public function templates(Request $request): JsonResponse
    {
        $templates = MissionTemplate::where('is_active', true)->get();

        return response()->json(['data' => $templates]);
    }

    public function storeTemplate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string|max:1000',
            'type'          => 'required|in:saving,budgeting,planning,custom,learning,social,goal,daily,weekly',
            'difficulty'    => 'nullable|in:beginner,explorer,saver,strategist,master',
            'reward_coins'  => 'nullable|numeric|min:0',
            'reward_points' => 'nullable|integer|min:0',
            'target_amount' => 'nullable|numeric|min:0',
            'age_group'     => 'nullable|in:child,teen',
            'conditions'    => 'nullable|array',
        ]);

        $template = MissionTemplate::create($data + ['created_by' => $request->user()->profile->id]);

        return response()->json(['data' => $template], 201);
    }
}

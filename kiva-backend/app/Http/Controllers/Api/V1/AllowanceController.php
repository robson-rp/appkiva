<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AllowanceConfig;
use App\Jobs\SendAllowanceJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AllowanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $configs = AllowanceConfig::where('parent_profile_id', $profile->id)->get();

        return response()->json(['data' => $configs]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'child_profile_id' => 'required|uuid|exists:profiles,id',
            'base_amount'      => 'required|numeric|min:0',
            'frequency'        => 'required|in:daily,weekly,monthly',
            'task_bonus'       => 'nullable|numeric|min:0',
            'mission_bonus'    => 'nullable|numeric|min:0',
        ]);

        $data['parent_profile_id'] = $request->user()->profile->id;

        $config = AllowanceConfig::updateOrCreate(
            ['child_profile_id' => $data['child_profile_id']],
            $data
        );

        return response()->json(['data' => $config], 201);
    }

    public function show(Request $request, string $allowance): JsonResponse
    {
        return response()->json(['data' => AllowanceConfig::findOrFail($allowance)]);
    }

    public function update(Request $request, string $allowance): JsonResponse
    {
        $config = AllowanceConfig::findOrFail($allowance);

        $data = $request->validate([
            'base_amount'   => 'nullable|numeric|min:0',
            'frequency'     => 'nullable|in:daily,weekly,monthly',
            'task_bonus'    => 'nullable|numeric|min:0',
            'mission_bonus' => 'nullable|numeric|min:0',
            'is_active'     => 'nullable|boolean',
        ]);

        $config->update($data);

        return response()->json(['data' => $config->fresh()]);
    }

    public function destroy(Request $request, string $allowance): JsonResponse
    {
        AllowanceConfig::findOrFail($allowance)->delete();

        return response()->json(null, 204);
    }

    public function process(Request $request): JsonResponse
    {
        $data = $request->validate(['child_profile_id' => 'required|uuid|exists:profiles,id']);

        $config = AllowanceConfig::where('child_profile_id', $data['child_profile_id'])
            ->where('is_active', true)
            ->firstOrFail();

        SendAllowanceJob::dispatch($config);

        return response()->json(['message' => 'Allowance queued for processing.']);
    }
}

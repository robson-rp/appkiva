<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChildResource;
use App\Services\ChildService;
use App\Models\Child;
use App\Models\Mission;
use App\Models\Task;
use App\Models\Streak;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ChildController extends Controller
{
    public function __construct(private readonly ChildService $childService) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile;

        $children = Child::with('profile')
            ->where('parent_profile_id', $profile->id)
            ->paginate(20);

        return response()->json([
            'data' => ChildResource::collection($children->items()),
            'meta' => [
                'total'        => $children->total(),
                'per_page'     => $children->perPage(),
                'current_page' => $children->currentPage(),
                'last_page'    => $children->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Child::class);

        $data = $request->validate([
            'display_name'     => 'required|string|max:100',
            'username'         => 'nullable|string|max:50|unique:children,username',
            'nickname'         => 'nullable|string|max:100',
            'pin'              => 'nullable|string|min:4|max:8',
            'date_of_birth'    => 'nullable|date|before:today',
            'daily_spend_limit' => 'nullable|numeric|min:0',
            'monthly_budget'   => 'nullable|numeric|min:0',
            'school_tenant_id' => 'nullable|uuid|exists:tenants,id',
            'language'         => 'nullable|string|max:5',
            'country'          => 'nullable|string|max:2',
            'currency'         => 'nullable|string|max:3',
        ]);

        $child = $this->childService->create($data, $request->user()->profile);

        return response()->json([
            'data' => new ChildResource($child),
        ], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $child = Child::with('profile')->findOrFail($id);
        $this->authorize('view', $child);

        return response()->json(['data' => new ChildResource($child)]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $child = Child::findOrFail($id);
        $this->authorize('update', $child);

        $data = $request->validate([
            'nickname'          => 'nullable|string|max:100',
            'username'          => 'nullable|string|max:50|unique:children,username,' . $child->id,
            'pin'               => 'nullable|string|min:4|max:8',
            'daily_spend_limit' => 'nullable|numeric|min:0',
            'monthly_budget'    => 'nullable|numeric|min:0',
            'school_tenant_id'  => 'nullable|uuid|exists:tenants,id',
        ]);

        if (isset($data['pin'])) {
            $data['pin_hash'] = Hash::make($data['pin']);
            unset($data['pin']);
        }

        $child->update($data);

        return response()->json(['data' => new ChildResource($child->fresh()->load('profile'))]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $child = Child::findOrFail($id);
        $this->authorize('delete', $child);

        $child->delete();

        return response()->json(null, 204);
    }

    public function setPin(Request $request, string $id): JsonResponse
    {
        $child = Child::findOrFail($id);
        $this->authorize('update', $child);

        $data = $request->validate([
            'pin' => 'required|string|min:4|max:8',
        ]);

        $child->update(['pin_hash' => Hash::make($data['pin'])]);

        return response()->json(null, 204);
    }

    public function summary(Request $request, string $id): JsonResponse
    {
        $child = Child::with('profile')->findOrFail($id);
        $this->authorize('view', $child);

        $wallet = Wallet::where('profile_id', $child->profile_id)
            ->where('wallet_type', 'virtual')
            ->where('is_active', true)
            ->first();

        $walletBalance = $wallet ? [
            'wallet_id' => $wallet->id,
            'balance'   => $wallet->balance,
            'currency'  => $wallet->currency,
        ] : null;

        $pendingTasks = Task::where('child_profile_id', $child->profile_id)
            ->where('status', 'pending')
            ->count();

        $activeMissions = Mission::where('child_profile_id', $child->profile_id)
            ->where('status', 'in_progress')
            ->count();

        $streak = Streak::where('profile_id', $child->profile_id)->first();

        return response()->json([
            'data' => [
                'child'           => new ChildResource($child),
                'wallet_balance'  => $walletBalance,
                'pending_tasks'   => $pendingTasks,
                'active_missions' => $activeMissions,
                'streak'          => $streak,
            ],
        ]);
    }
}

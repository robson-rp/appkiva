<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BudgetExceptionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetExceptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $items = BudgetExceptionRequest::where('child_profile_id', $profile->id)
            ->orWhere('parent_profile_id', $profile->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['data' => $items->items(), 'meta' => ['total' => $items->total()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount'    => 'required|numeric|min:0.01',
            'reason'    => 'nullable|string|max:500',
            'reward_id' => 'nullable|uuid|exists:rewards,id',
        ]);

        $profile = $request->user()->profile;
        $data['child_profile_id'] = $profile->id;

        $req = BudgetExceptionRequest::create($data);

        return response()->json(['data' => $req], 201);
    }

    public function resolve(Request $request, string $id): JsonResponse
    {
        $req = BudgetExceptionRequest::findOrFail($id);

        $data = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $req->update([
            'status'      => $data['status'],
            'resolved_by' => $request->user()->profile->id,
            'resolved_at' => now(),
        ]);

        return response()->json(['data' => $req->fresh()]);
    }
}

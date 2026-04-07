<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\LedgerEntry;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RewardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $rewards = Reward::where('parent_profile_id', $profile->id)
            ->orWhereHas('claimedBy', fn($q) => $q->where('household_id', $profile->household_id))
            ->paginate(20);

        return response()->json(['data' => $rewards->items(), 'meta' => ['total' => $rewards->total()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string|max:500',
            'icon'        => 'nullable|string|max:255',
            'price'       => 'required|numeric|min:0',
            'category'    => 'nullable|in:experience,privilege,physical,digital',
        ]);

        $profile = $request->user()->profile;
        $data['parent_profile_id'] = $profile->id;
        $data['household_id']      = $profile->household_id;

        $reward = Reward::create($data);

        return response()->json(['data' => $reward], 201);
    }

    public function show(Request $request, string $reward): JsonResponse
    {
        return response()->json(['data' => Reward::findOrFail($reward)]);
    }

    public function update(Request $request, string $reward): JsonResponse
    {
        $r = Reward::findOrFail($reward);

        $data = $request->validate([
            'name'      => 'nullable|string|max:150',
            'price'     => 'nullable|numeric|min:0',
            'available' => 'nullable|boolean',
        ]);

        $r->update($data);

        return response()->json(['data' => $r->fresh()]);
    }

    public function destroy(Request $request, string $reward): JsonResponse
    {
        Reward::findOrFail($reward)->delete();

        return response()->json(null, 204);
    }

    public function claim(Request $request, string $reward): JsonResponse
    {
        $r = Reward::findOrFail($reward);
        $profile = $request->user()->profile;

        if (!$r->available) {
            return response()->json(['message' => 'Reward is not available.'], 422);
        }

        DB::transaction(function () use ($r, $profile) {
            if ($r->price > 0) {
                $wallet = Wallet::where('profile_id', $profile->id)
                    ->where('wallet_type', 'virtual')
                    ->where('is_active', true)
                    ->first();

                if (!$wallet || (float) $wallet->balance < (float) $r->price) {
                    throw new \RuntimeException('Insufficient balance.');
                }

                LedgerEntry::create([
                    'debit_wallet_id' => $wallet->id,
                    'amount'          => $r->price,
                    'entry_type'      => 'purchase',
                    'description'     => 'Reward claim: ' . $r->name,
                    'reference_id'    => $r->id,
                    'reference_type'  => 'reward',
                    'idempotency_key' => 'reward_claim_' . $r->id . '_' . $profile->id,
                ]);
            }

            $r->update([
                'available'  => false,
                'claimed_by' => $profile->id,
                'claimed_at' => now(),
            ]);
        });

        return response()->json(['data' => $r->fresh()]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DreamVault;
use App\Models\DreamVaultComment;
use App\Models\LedgerEntry;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DreamVaultController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        return response()->json(['data' => DreamVault::where('profile_id', $profile->id)->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'         => 'required|string|max:150',
            'description'   => 'nullable|string|max:500',
            'icon'          => 'nullable|string|max:255',
            'priority'      => 'nullable|integer|min:1',
            'target_amount' => 'nullable|numeric|min:0',
        ]);

        $profile = $request->user()->profile;
        $data['profile_id']   = $profile->id;
        $data['household_id'] = $profile->household_id;

        return response()->json(['data' => DreamVault::create($data)], 201);
    }

    public function show(Request $request, string $vault): JsonResponse
    {
        return response()->json(['data' => DreamVault::findOrFail($vault)]);
    }

    public function update(Request $request, string $vault): JsonResponse
    {
        $v = DreamVault::findOrFail($vault);

        $v->update($request->validate([
            'title'         => 'nullable|string|max:150',
            'description'   => 'nullable|string|max:500',
            'priority'      => 'nullable|integer|min:1',
            'target_amount' => 'nullable|numeric|min:0',
        ]));

        return response()->json(['data' => $v->fresh()]);
    }

    public function destroy(Request $request, string $vault): JsonResponse
    {
        DreamVault::findOrFail($vault)->delete();

        return response()->json(null, 204);
    }

    public function contribute(Request $request, string $vault): JsonResponse
    {
        $v = DreamVault::findOrFail($vault);
        $data = $request->validate(['amount' => 'required|numeric|min:0.0001']);

        DB::transaction(function () use ($v, $data, $request) {
            $profile = $request->user()->profile;

            $wallet = Wallet::where('profile_id', $profile->id)
                ->where('wallet_type', 'virtual')->where('is_active', true)->firstOrFail();

            if ((float) $wallet->balance < (float) $data['amount']) {
                throw new \RuntimeException('Insufficient balance.');
            }

            LedgerEntry::create([
                'debit_wallet_id' => $wallet->id,
                'amount'          => $data['amount'],
                'entry_type'      => 'vault_deposit',
                'description'     => 'Contribution to dream: ' . $v->title,
                'reference_id'    => $v->id,
                'reference_type'  => 'dream_vault',
                'idempotency_key' => 'dream_contribute_' . $v->id . '_' . now()->timestamp,
            ]);

            $v->increment('current_amount', $data['amount']);
        });

        return response()->json(['data' => $v->fresh()]);
    }

    public function comments(Request $request, string $vault): JsonResponse
    {
        $v = DreamVault::findOrFail($vault);

        return response()->json(['data' => DreamVaultComment::with('parentProfile')->where('dream_vault_id', $v->id)->get()]);
    }

    public function addComment(Request $request, string $vault): JsonResponse
    {
        $v = DreamVault::findOrFail($vault);

        $data = $request->validate([
            'text'  => 'required|string|max:500',
            'emoji' => 'nullable|string|max:10',
        ]);

        $data['dream_vault_id']      = $v->id;
        $data['parent_profile_id']   = $request->user()->profile->id;

        $comment = DreamVaultComment::create($data);

        return response()->json(['data' => $comment], 201);
    }
}

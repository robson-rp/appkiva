<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SavingsVault;
use App\Models\LedgerEntry;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VaultController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;
        $vaults  = SavingsVault::where('profile_id', $profile->id)->get();

        return response()->json(['data' => $vaults]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                     => 'required|string|max:150',
            'icon'                     => 'nullable|string|max:255',
            'target_amount'            => 'nullable|numeric|min:0',
            'interest_rate'            => 'nullable|numeric|min:0|max:100',
            'requires_parent_approval' => 'nullable|boolean',
        ]);

        $profile = $request->user()->profile;
        $data['profile_id']   = $profile->id;
        $data['household_id'] = $profile->household_id;

        $vault = SavingsVault::create($data);

        return response()->json(['data' => $vault], 201);
    }

    public function show(Request $request, string $vaultId): JsonResponse
    {
        return response()->json(['data' => SavingsVault::findOrFail($vaultId)]);
    }

    public function update(Request $request, string $vaultId): JsonResponse
    {
        $v = SavingsVault::findOrFail($vaultId);

        $data = $request->validate([
            'name'          => 'nullable|string|max:150',
            'target_amount' => 'nullable|numeric|min:0',
            'interest_rate' => 'nullable|numeric|min:0|max:100',
        ]);

        $v->update($data);

        return response()->json(['data' => $v->fresh()]);
    }

    public function destroy(Request $request, string $vaultId): JsonResponse
    {
        SavingsVault::findOrFail($vaultId)->delete();

        return response()->json(null, 204);
    }

    public function deposit(Request $request, string $vaultId): JsonResponse
    {
        $v = SavingsVault::findOrFail($vaultId);
        $data = $request->validate(['amount' => 'required|numeric|min:0.0001']);

        try {
            DB::transaction(function () use ($v, $data, $request) {
                $wallet = Wallet::where('profile_id', $v->profile_id)
                    ->where('wallet_type', 'virtual')->where('is_active', true)->firstOrFail();

                if ((float) $wallet->balance < (float) $data['amount']) {
                    throw new \RuntimeException('Insufficient balance.');
                }

                LedgerEntry::create([
                    'debit_wallet_id' => $wallet->id,
                    'amount'          => $data['amount'],
                    'entry_type'      => 'vault_deposit',
                    'description'     => 'Deposit to vault: ' . $v->name,
                    'reference_id'    => $v->id,
                    'reference_type'  => 'savings_vault',
                    'idempotency_key' => 'vault_deposit_' . $v->id . '_' . now()->timestamp,
                ]);

                $v->increment('current_amount', $data['amount']);
            });
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $v->fresh()]);
    }

    public function withdraw(Request $request, string $vaultId): JsonResponse
    {
        $v = SavingsVault::findOrFail($vaultId);
        $data = $request->validate(['amount' => 'required|numeric|min:0.0001']);

        try {
            DB::transaction(function () use ($v, $data, $request) {
                if ((float) $v->current_amount < (float) $data['amount']) {
                    throw new \RuntimeException('Insufficient vault balance.');
                }

                $wallet = Wallet::where('profile_id', $v->profile_id)
                    ->where('wallet_type', 'virtual')->where('is_active', true)->firstOrFail();

                LedgerEntry::create([
                    'credit_wallet_id' => $wallet->id,
                    'amount'           => $data['amount'],
                    'entry_type'       => 'vault_withdraw',
                    'description'      => 'Withdraw from vault: ' . $v->name,
                    'reference_id'     => $v->id,
                    'reference_type'   => 'savings_vault',
                    'idempotency_key'  => 'vault_withdraw_' . $v->id . '_' . now()->timestamp,
                ]);

                $v->decrement('current_amount', $data['amount']);
            });
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $v->fresh()]);
    }
}

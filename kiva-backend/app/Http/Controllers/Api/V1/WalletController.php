<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WalletResource;
use App\Http\Resources\LedgerEntryResource;
use App\Models\Wallet;
use App\Models\LedgerEntry;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(private readonly WalletService $walletService) {}

    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $wallets = Wallet::where('profile_id', $profile->id)
            ->where('is_active', true)
            ->get();

        return response()->json(['data' => WalletResource::collection($wallets)]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $wallet = Wallet::findOrFail($id);
        $this->authorize('view', $wallet);

        return response()->json(['data' => new WalletResource($wallet)]);
    }

    public function transactions(Request $request, string $id): JsonResponse
    {
        $wallet = Wallet::findOrFail($id);
        $this->authorize('view', $wallet);

        $entries = LedgerEntry::where(function ($q) use ($id) {
            $q->where('credit_wallet_id', $id)
              ->orWhere('debit_wallet_id', $id);
        })->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => LedgerEntryResource::collection($entries->items()),
            'meta' => [
                'total'        => $entries->total(),
                'per_page'     => $entries->perPage(),
                'current_page' => $entries->currentPage(),
                'last_page'    => $entries->lastPage(),
            ],
        ]);
    }

    public function createTransaction(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $data = $request->validate([
            'credit_wallet_id'  => 'nullable|uuid|exists:wallets,id',
            'debit_wallet_id'   => 'nullable|uuid|exists:wallets,id',
            'amount'            => 'required|numeric|min:0.0001',
            'description'       => 'nullable|string|max:500',
            'entry_type'        => 'required|in:allowance,task_reward,mission_reward,purchase,donation,vault_deposit,vault_withdraw,vault_interest,transfer,adjustment,refund',
            'requires_approval' => 'nullable|boolean',
            'idempotency_key'   => 'nullable|string|max:255',
            'reference_id'      => 'nullable|uuid',
            'reference_type'    => 'nullable|string|max:100',
            'metadata'          => 'nullable|array',
        ]);

        $data['created_by'] = $profile->id;

        try {
            $entry = $this->walletService->createTransaction($data);
            return response()->json(['data' => new LedgerEntryResource($entry)], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function freeze(Request $request, string $id): JsonResponse
    {
        $wallet = Wallet::findOrFail($id);
        $this->authorize('update', $wallet);

        $data = $request->validate([
            'freeze_reason' => 'nullable|string|max:255',
        ]);

        $wallet->update([
            'is_frozen'    => true,
            'freeze_reason' => $data['freeze_reason'] ?? null,
            'frozen_at'    => now(),
            'frozen_by'    => $request->user()->profile->id,
        ]);

        return response()->json(['data' => new WalletResource($wallet->fresh())]);
    }

    public function unfreeze(Request $request, string $id): JsonResponse
    {
        $wallet = Wallet::findOrFail($id);
        $this->authorize('update', $wallet);

        $wallet->update([
            'is_frozen'    => false,
            'freeze_reason' => null,
            'frozen_at'    => null,
            'frozen_by'    => null,
        ]);

        return response()->json(['data' => new WalletResource($wallet->fresh())]);
    }

    public function balance(Request $request, string $id): JsonResponse
    {
        $wallet = Wallet::findOrFail($id);
        $this->authorize('view', $wallet);

        return response()->json([
            'data' => [
                'wallet_id' => $wallet->id,
                'balance'   => $wallet->balance,
                'currency'  => $wallet->currency,
            ],
        ]);
    }

    public function transfer(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $data = $request->validate([
            'from_wallet_id' => 'required|uuid|exists:wallets,id',
            'to_wallet_id'   => 'required|uuid|exists:wallets,id|different:from_wallet_id',
            'amount'         => 'required|numeric|min:0.0001',
            'description'    => 'nullable|string|max:500',
            'idempotency_key' => 'nullable|string|max:255',
        ]);

        try {
            $entry = $this->walletService->createTransaction([
                'debit_wallet_id'  => $data['from_wallet_id'],
                'credit_wallet_id' => $data['to_wallet_id'],
                'amount'           => $data['amount'],
                'description'      => $data['description'] ?? null,
                'entry_type'       => 'transfer',
                'created_by'       => $profile->id,
                'idempotency_key'  => $data['idempotency_key'] ?? null,
            ]);

            return response()->json(['data' => new LedgerEntryResource($entry)], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}

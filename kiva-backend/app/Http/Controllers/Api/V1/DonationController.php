<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\DonationCause;
use App\Models\LedgerEntry;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DonationController extends Controller
{
    public function causes(Request $request): JsonResponse
    {
        $causes = DonationCause::where('is_active', true)->get();

        return response()->json(['data' => $causes]);
    }

    public function donate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cause_id' => 'required|uuid|exists:donation_causes,id',
            'amount'   => 'required|numeric|min:0.01',
        ]);

        $profile = $request->user()->profile;

        DB::transaction(function () use ($data, $profile) {
            $wallet = Wallet::where('profile_id', $profile->id)
                ->where('wallet_type', 'virtual')
                ->where('is_active', true)
                ->firstOrFail();

            if ((float) $wallet->balance < (float) $data['amount']) {
                throw new \RuntimeException('Insufficient balance.');
            }

            LedgerEntry::create([
                'debit_wallet_id' => $wallet->id,
                'amount'          => $data['amount'],
                'entry_type'      => 'donation',
                'reference_id'    => $data['cause_id'],
                'reference_type'  => 'donation_cause',
                'idempotency_key' => 'donation_' . $profile->id . '_' . $data['cause_id'] . '_' . now()->timestamp,
            ]);

            Donation::create([
                'profile_id' => $profile->id,
                'cause_id'   => $data['cause_id'],
                'amount'     => $data['amount'],
            ]);

            DonationCause::where('id', $data['cause_id'])->increment('total_received', $data['amount']);
        });

        return response()->json(['data' => ['status' => 'success']], 201);
    }

    public function myDonations(Request $request): JsonResponse
    {
        $profile   = $request->user()->profile;
        $donations = Donation::with('cause')->where('profile_id', $profile->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['data' => $donations->items(), 'meta' => ['total' => $donations->total()]]);
    }

    public function listCauses(Request $request): JsonResponse
    {
        $causes = DonationCause::paginate(20);

        return response()->json([
            'data' => $causes->items(),
            'meta' => [
                'total'        => $causes->total(),
                'per_page'     => $causes->perPage(),
                'current_page' => $causes->currentPage(),
                'last_page'    => $causes->lastPage(),
            ],
        ]);
    }

    public function storeCause(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string|max:1000',
            'icon'        => 'nullable|string|max:255',
            'category'    => 'nullable|string|max:100',
            'is_active'   => 'nullable|boolean',
        ]);

        $data['created_by'] = $request->user()->profile->id;

        $cause = DonationCause::create($data);

        return response()->json(['data' => $cause], 201);
    }

    public function showCause(Request $request, string $causeId): JsonResponse
    {
        return response()->json(['data' => DonationCause::findOrFail($causeId)]);
    }

    public function updateCause(Request $request, string $causeId): JsonResponse
    {
        $cause = DonationCause::findOrFail($causeId);

        $cause->update($request->validate([
            'name'        => 'nullable|string|max:150',
            'description' => 'nullable|string|max:1000',
            'icon'        => 'nullable|string|max:255',
            'category'    => 'nullable|string|max:100',
            'is_active'   => 'nullable|boolean',
        ]));

        return response()->json(['data' => $cause->fresh()]);
    }
}

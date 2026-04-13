<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SubscriptionTier;
use App\Models\SubscriptionInvoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SubscriptionController extends Controller
{
    public function current(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;
        $tenant  = $profile->tenant;

        if (!$tenant) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => $tenant->load('subscriptionTier')]);
    }

    public function tiers(Request $request): JsonResponse
    {
        $tiers = SubscriptionTier::where('is_active', true)->get();

        return response()->json(['data' => $tiers]);
    }

    public function invoices(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        if (!$profile->tenant_id) {
            return response()->json(['data' => []]);
        }

        $invoices = SubscriptionInvoice::where('tenant_id', $profile->tenant_id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['data' => $invoices->items(), 'meta' => ['total' => $invoices->total()]]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tier_id'        => 'required|uuid|exists:subscription_tiers,id',
            'billing_period' => 'required|in:monthly,yearly',
        ]);

        $profile = $request->user()->profile;
        $tenant  = $profile->tenant;

        if (!$tenant) {
            return response()->json(['message' => 'Tenant não encontrado.'], 404);
        }

        $tier = SubscriptionTier::findOrFail($validated['tier_id']);

        $amount = $validated['billing_period'] === 'yearly'
            ? $tier->price_yearly
            : $tier->price_monthly;

        $tenant->update(['subscription_tier_id' => $tier->id]);

        SubscriptionInvoice::create([
            'tenant_id'      => $tenant->id,
            'tier_id'        => $tier->id,
            'amount'         => $amount,
            'currency'       => $tier->currency,
            'status'         => 'pending',
            'billing_period' => $validated['billing_period'],
            'due_date'       => Carbon::now()->addDays(7),
        ]);

        return response()->json(['data' => $tenant->load('subscriptionTier')]);
    }

    public function cancelSubscription(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;
        $tenant  = $profile->tenant;

        if (!$tenant) {
            return response()->json(['message' => 'Tenant não encontrado.'], 404);
        }

        if (!$tenant->subscription_tier_id) {
            return response()->json(['message' => 'Sem subscrição activa.'], 400);
        }

        $tenant->update(['subscription_tier_id' => null]);

        return response()->json(['data' => $tenant->fresh()]);
    }
}

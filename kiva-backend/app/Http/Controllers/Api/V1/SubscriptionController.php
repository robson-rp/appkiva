<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SubscriptionTier;
use App\Models\SubscriptionInvoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
}

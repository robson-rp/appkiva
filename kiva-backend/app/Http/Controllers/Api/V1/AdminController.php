<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserProfileResource;
use App\Models\Profile;
use App\Models\Tenant;
use App\Models\RiskFlag;
use App\Models\SupportedCurrency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        return response()->json(['data' => [
            'total_users'    => \App\Models\User::count(),
            'total_children' => \App\Models\Child::count(),
            'total_tenants'  => Tenant::count(),
            'active_missions' => \App\Models\Mission::where('status', 'in_progress')->count(),
            'open_risk_flags' => RiskFlag::whereNull('resolved_at')->count(),
        ]]);
    }

    public function users(Request $request): JsonResponse
    {
        $users = Profile::with('user')
            ->when($request->search, fn($q, $s) => $q->where('display_name', 'like', "%{$s}%"))
            ->paginate(30);

        return response()->json([
            'data' => UserProfileResource::collection($users->items()),
            'meta' => ['total' => $users->total(), 'current_page' => $users->currentPage(), 'last_page' => $users->lastPage()],
        ]);
    }

    public function auditLog(Request $request): JsonResponse
    {
        $rows = DB::table('audit_log')
            ->when($request->profile_id, fn($q, $id) => $q->where('profile_id', $id))
            ->when($request->action, fn($q, $a) => $q->where('action', $a))
            ->orderByDesc('created_at')
            ->paginate(30);

        return response()->json([
            'data' => $rows->items(),
            'meta' => ['total' => $rows->total()],
        ]);
    }

    public function riskFlags(Request $request): JsonResponse
    {
        $flags = RiskFlag::with('profile')
            ->when(!$request->boolean('resolved'), fn($q) => $q->whereNull('resolved_at'))
            ->orderByDesc('created_at')
            ->paginate(30);

        return response()->json(['data' => $flags->items(), 'meta' => ['total' => $flags->total()]]);
    }

    public function resolveRiskFlag(Request $request, string $id): JsonResponse
    {
        $flag = RiskFlag::findOrFail($id);

        $data = $request->validate(['resolution_notes' => 'nullable|string|max:1000']);

        $flag->update([
            'resolved_by'      => $request->user()->profile->id,
            'resolved_at'      => now(),
            'resolution_notes' => $data['resolution_notes'] ?? null,
        ]);

        return response()->json(['data' => $flag->fresh()]);
    }

    public function currencies(Request $request): JsonResponse
    {
        return response()->json(['data' => SupportedCurrency::where('is_active', true)->get()]);
    }

    public function storeCurrency(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'           => 'required|string|size:3|unique:supported_currencies,code',
            'name'           => 'required|string|max:100',
            'symbol'         => 'required|string|max:10',
            'decimal_places' => 'nullable|integer|min:0|max:8',
        ]);

        $currency = SupportedCurrency::create($data);

        return response()->json(['data' => $currency], 201);
    }

    public function tenants(Request $request): JsonResponse
    {
        $tenants = Tenant::with('subscriptionTier')
            ->when($request->type, fn($q, $t) => $q->where('tenant_type', $t))
            ->paginate(30);

        return response()->json(['data' => $tenants->items(), 'meta' => ['total' => $tenants->total()]]);
    }

    public function storeTenant(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                    => 'required|string|max:150',
            'slug'                    => 'nullable|string|max:100|unique:tenants,slug',
            'tenant_type'             => 'required|in:family,school,institutional_partner',
            'currency'                => 'nullable|string|size:3',
            'subscription_tier_id'    => 'nullable|uuid|exists:subscription_tiers,id',
            'real_money_enabled'      => 'nullable|boolean',
        ]);

        $tenant = Tenant::create($data);

        return response()->json(['data' => $tenant], 201);
    }

    public function updateTenant(Request $request, string $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);

        $tenant->update($request->validate([
            'name'                 => 'nullable|string|max:150',
            'is_active'            => 'nullable|boolean',
            'real_money_enabled'   => 'nullable|boolean',
            'subscription_tier_id' => 'nullable|uuid|exists:subscription_tiers,id',
        ]));

        return response()->json(['data' => $tenant->fresh()]);
    }

    public function destroyTenant(Request $request, string $id): JsonResponse
    {
        Tenant::findOrFail($id)->delete();

        return response()->json(null, 204);
    }
}

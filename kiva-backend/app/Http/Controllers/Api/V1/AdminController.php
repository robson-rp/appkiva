<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserProfileResource;
use App\Models\CurrencyExchangeRate;
use App\Models\LoginBanner;
use App\Models\OnboardingStep;
use App\Models\Profile;
use App\Models\SubscriptionInvoice;
use App\Models\Tenant;
use App\Models\RiskFlag;
use App\Models\SupportedCurrency;
use App\Models\User;
use App\Models\UserRole;
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
            'name'               => 'nullable|string|max:150',
            'real_money_enabled' => 'nullable|boolean',
        ]));

        return response()->json(['data' => $tenant->fresh()]);
    }

    public function activateTenant(Request $request, string $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['is_active' => true]);

        return response()->json(['data' => $tenant->fresh()]);
    }

    public function deactivateTenant(Request $request, string $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['is_active' => false]);

        return response()->json(['data' => $tenant->fresh()]);
    }

    public function setTenantSubscription(Request $request, string $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);

        $data = $request->validate([
            'subscription_tier_id' => 'required|uuid|exists:subscription_tiers,id',
        ]);

        $tenant->update(['subscription_tier_id' => $data['subscription_tier_id']]);

        return response()->json(['data' => $tenant->fresh()]);
    }

    public function destroyTenant(Request $request, string $id): JsonResponse
    {
        Tenant::findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    public function exchangeRates(Request $request): JsonResponse
    {
        return response()->json(['data' => CurrencyExchangeRate::all()]);
    }

    public function updateExchangeRate(Request $request, string $id): JsonResponse
    {
        $rate = CurrencyExchangeRate::findOrFail($id);

        $data = $request->validate([
            'rate' => 'required|numeric|min:0',
        ]);

        $rate->update($data);

        return response()->json(['data' => $rate->fresh()]);
    }

    public function loginBanners(Request $request): JsonResponse
    {
        return response()->json(['data' => LoginBanner::orderBy('display_order')->get()]);
    }

    public function storeLoginBanner(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'         => 'required|string|max:255',
            'image_url'     => 'required|string|max:500',
            'link_url'      => 'nullable|string|max:500',
            'display_order' => 'nullable|integer|min:0',
            'is_active'     => 'nullable|boolean',
        ]);

        $banner = LoginBanner::create($data);

        return response()->json(['data' => $banner], 201);
    }

    public function toggleCurrencyActive(Request $request, string $code): JsonResponse
    {
        $currency = SupportedCurrency::where('code', strtoupper($code))->firstOrFail();
        $currency->update(['is_active' => !$currency->is_active]);

        return response()->json(['data' => $currency->fresh()]);
    }

    public function updateLoginBanner(Request $request, string $id): JsonResponse
    {
        $banner = LoginBanner::findOrFail($id);

        $banner->update($request->validate([
            'title'         => 'nullable|string|max:255',
            'image_url'     => 'nullable|string|max:500',
            'link_url'      => 'nullable|string|max:500',
            'display_order' => 'nullable|integer|min:0',
        ]));

        return response()->json(['data' => $banner->fresh()]);
    }

    public function toggleLoginBannerActive(Request $request, string $id): JsonResponse
    {
        $banner = LoginBanner::findOrFail($id);
        $banner->update(['is_active' => !$banner->is_active]);

        return response()->json(['data' => $banner->fresh()]);
    }

    public function reorderLoginBanners(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items'                 => 'required|array',
            'items.*.id'            => 'required|uuid|exists:login_banners,id',
            'items.*.display_order' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($data) {
            foreach ($data['items'] as $item) {
                LoginBanner::where('id', $item['id'])->update(['display_order' => $item['display_order']]);
            }
        });

        return response()->json(['data' => LoginBanner::orderBy('display_order')->get()]);
    }

    public function markInvoicePaid(Request $request, string $id): JsonResponse
    {
        $invoice = SubscriptionInvoice::findOrFail($id);

        if ($invoice->status === 'paid') {
            return response()->json(['message' => 'Invoice is already paid.'], 422);
        }

        $data = $request->validate([
            'payment_method'    => 'nullable|in:manual,bank_transfer,card,mpesa,express',
            'payment_reference' => 'nullable|string|max:255',
        ]);

        $invoice->update([
            'status'            => 'paid',
            'paid_at'           => now(),
            'payment_method'    => $data['payment_method'] ?? 'manual',
            'payment_reference' => $data['payment_reference'] ?? null,
        ]);

        return response()->json(['data' => $invoice->fresh()]);
    }

    public function destroyLoginBanner(Request $request, string $id): JsonResponse
    {
        LoginBanner::findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    public function onboardingSteps(Request $request): JsonResponse
    {
        return response()->json(['data' => OnboardingStep::orderBy('step_index')->get()]);
    }

    public function updateOnboardingStep(Request $request, string $id): JsonResponse
    {
        $step = OnboardingStep::findOrFail($id);

        $step->update($request->validate([
            'title'            => 'nullable|string|max:255',
            'description'      => 'nullable|string|max:1000',
            'illustration_key' => 'nullable|string|max:255',
            'cta'              => 'nullable|string|max:150',
            'step_index'       => 'nullable|integer|min:0',
            'is_active'        => 'nullable|boolean',
            'visible_from'     => 'nullable|date',
            'visible_until'    => 'nullable|date|after_or_equal:visible_from',
        ]));

        return response()->json(['data' => $step->fresh()]);
    }

    public function getUserRoles(Request $request, string $userId): JsonResponse
    {
        $user = User::findOrFail($userId);

        $roles = UserRole::where('user_id', $user->id)->get();

        return response()->json(['data' => $roles]);
    }

    public function updateUserRoles(Request $request, string $userId): JsonResponse
    {
        $user = User::findOrFail($userId);

        $data = $request->validate([
            'roles'   => 'required|array',
            'roles.*' => 'string|in:parent,child,teen,teacher,admin,partner',
        ]);

        UserRole::where('user_id', $user->id)->delete();

        $roles = collect($data['roles'])->map(fn($role) => UserRole::create([
            'user_id' => $user->id,
            'role'    => $role,
        ]));

        return response()->json(['data' => $roles]);
    }
}

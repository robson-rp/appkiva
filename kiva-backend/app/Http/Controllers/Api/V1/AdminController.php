<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserProfileResource;
use App\Models\CurrencyExchangeRate;
use App\Models\LoginBanner;
use App\Models\OnboardingStep;
use App\Models\Profile;
use App\Models\SubscriptionInvoice;
use App\Models\SubscriptionTier;
use App\Models\Tenant;
use App\Models\RiskFlag;
use App\Models\SupportedCurrency;
use App\Models\RegionalPrice;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Wallet;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $tenantsByType = Tenant::selectRaw('tenant_type, count(*) as total')
            ->groupBy('tenant_type')
            ->pluck('total', 'tenant_type');

        $walletCount   = Wallet::withoutGlobalScopes()->count();
        $totalEmitted  = (float) DB::table('ledger_entries')
            ->where('entry_type', 'emit')->sum('amount');
        $totalBurned   = (float) DB::table('ledger_entries')
            ->where('entry_type', 'burn')->sum('amount');
        $inCirculation = $totalEmitted - $totalBurned;

        $systemWallet = Wallet::withoutGlobalScopes()->where('is_system', true)->first();

        return response()->json(['data' => [
            'totalTenants'        => Tenant::count(),
            'activeTenants'       => Tenant::where('is_active', true)->count(),
            'tenantsByType'       => [
                'family'                => (int) ($tenantsByType['family'] ?? 0),
                'school'               => (int) ($tenantsByType['school'] ?? 0),
                'institutional_partner' => (int) ($tenantsByType['institutional_partner'] ?? 0),
            ],
            'totalUsers'          => \App\Models\User::count(),
            'totalChildren'       => \App\Models\Child::count(),
            'activeMissions'      => \App\Models\Mission::where('status', 'in_progress')->count(),
            'openRiskFlags'       => RiskFlag::whereNull('resolved_at')->count(),
            'totalWallets'        => $walletCount,
            'dau'                 => 0,
            'missionCompletionRate' => 0,
            'totalTasks'          => 0,
            'completedTasks'      => 0,
            'dailyTxVolume'       => 0,
            'dailyTxCount'        => 0,
            'weeklySparkline'     => [],
            'money_supply'        => [
                'total_emitted'        => $totalEmitted,
                'total_burned'         => $totalBurned,
                'total_in_circulation' => $inCirculation,
                'total_in_wallets'     => $inCirculation,
                'total_in_vaults'      => 0,
                'wallet_count'         => $walletCount,
                'system_wallet_id'     => $systemWallet?->id ?? '',
                'audit_timestamp'      => now()->toIso8601String(),
            ],
        ]]);
    }

    public function users(Request $request): JsonResponse
    {
        $users = Profile::withoutGlobalScope(\App\Models\Scopes\TenantScope::class)
            ->with(['user', 'household', 'tenant'])
            ->when($request->search, fn($q, $s) => $q->where('display_name', 'like', "%{$s}%"))
            ->paginate(50);

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
            ->when($request->resource_type, fn($q, $rt) => $q->where('resource_type', $rt))
            ->orderByDesc('created_at')
            ->paginate((int) $request->query('limit', 30));

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
        AuditService::log('admin_action', 'tenants', $id, ['is_active' => false], ['is_active' => true], null, null, null, ['action' => 'activate_tenant', 'name' => $tenant->name]);

        return response()->json(['data' => $tenant->fresh()]);
    }

    public function deactivateTenant(Request $request, string $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['is_active' => false]);
        AuditService::log('admin_action', 'tenants', $id, ['is_active' => true], ['is_active' => false], null, null, null, ['action' => 'deactivate_tenant', 'name' => $tenant->name]);

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

    public function adminWallets(Request $request): JsonResponse
    {
        $query = Wallet::withoutGlobalScopes()->with(['profile']);

        if ($request->boolean('is_frozen')) {
            $query->where('is_frozen', true);
        }

        $wallets = $query->orderByDesc('created_at')->paginate(50);

        return response()->json(['data' => $wallets->items(), 'meta' => ['total' => $wallets->total()]]);
    }

    public function adminProfiles(Request $request): JsonResponse
    {
        $query = Profile::withoutGlobalScope(\App\Models\Scopes\TenantScope::class);

        if ($request->has('ids')) {
            $ids = explode(',', $request->query('ids'));
            // Filter to valid UUID format only
            $ids = array_filter($ids, fn($id) => preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', trim($id)));
            $query->whereIn('id', $ids);
        }

        return response()->json(['data' => $query->get(['id', 'display_name', 'avatar_url'])]);
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

    // ── Regional Prices ───────────────────────────────────────

    public function regionalPrices(Request $request): JsonResponse
    {
        return response()->json(['data' => RegionalPrice::all()]);
    }

    public function storeRegionalPrice(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tier_id'           => 'required|uuid|exists:subscription_tiers,id',
            'currency_code'     => 'required|string|max:10',
            'price_monthly'     => 'required|numeric|min:0',
            'price_yearly'      => 'required|numeric|min:0',
            'extra_child_price' => 'required|numeric|min:0',
        ]);

        $price = RegionalPrice::updateOrCreate(
            ['tier_id' => $data['tier_id'], 'currency_code' => $data['currency_code']],
            $data
        );

        return response()->json(['data' => $price], 201);
    }

    public function updateRegionalPrice(Request $request, string $id): JsonResponse
    {
        $price = RegionalPrice::findOrFail($id);

        $data = $request->validate([
            'price_monthly'     => 'required|numeric|min:0',
            'price_yearly'      => 'required|numeric|min:0',
            'extra_child_price' => 'required|numeric|min:0',
        ]);

        $price->update($data);

        return response()->json(['data' => $price->fresh()]);
    }

    public function destroyRegionalPrice(Request $request, string $id): JsonResponse
    {
        RegionalPrice::findOrFail($id)->delete();

        return response()->json(null, 204);
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
            'is_active'     => 'nullable|boolean',
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

    public function subscriptionTiers(Request $request): JsonResponse
    {
        $showInactive = filter_var($request->query('show_inactive', 'false'), FILTER_VALIDATE_BOOLEAN);
        $tiers = $showInactive
            ? SubscriptionTier::orderBy('price_monthly')->get()
            : SubscriptionTier::where('is_active', true)->orderBy('price_monthly')->get();

        return response()->json(['data' => $tiers]);
    }

    public function storeSubscriptionTier(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'              => 'required|string|max:100',
            'tier_type'         => 'required|string|in:free,family_premium,school_institutional,partner_program',
            'description'       => 'nullable|string',
            'price_monthly'     => 'required|numeric|min:0',
            'price_yearly'      => 'nullable|numeric|min:0',
            'currency'          => 'required|string|size:3',
            'max_children'      => 'nullable|integer|min:0',
            'max_classrooms'    => 'nullable|integer|min:0',
            'extra_child_price' => 'nullable|numeric|min:0',
            'features'          => 'nullable|array',
            'is_active'         => 'sometimes|boolean',
        ]);

        $tier = SubscriptionTier::create($data);

        return response()->json(['data' => $tier], 201);
    }

    public function updateSubscriptionTier(Request $request, string $id): JsonResponse
    {
        $tier = SubscriptionTier::findOrFail($id);

        $data = $request->validate([
            'name'              => 'sometimes|string|max:100',
            'tier_type'         => 'sometimes|string|in:free,family_premium,school_institutional,partner_program',
            'description'       => 'nullable|string',
            'price_monthly'     => 'sometimes|numeric|min:0',
            'price_yearly'      => 'nullable|numeric|min:0',
            'currency'          => 'sometimes|string|size:3',
            'max_children'      => 'nullable|integer|min:0',
            'max_classrooms'    => 'nullable|integer|min:0',
            'extra_child_price' => 'nullable|numeric|min:0',
            'features'          => 'nullable|array',
            'is_active'         => 'sometimes|boolean',
        ]);

        $tier->update($data);

        return response()->json(['data' => $tier->fresh()]);
    }

    public function destroySubscriptionTier(Request $request, string $id): JsonResponse
    {
        $tier = SubscriptionTier::findOrFail($id);
        $tier->delete();

        return response()->json(null, 204);
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

        $oldRoles = UserRole::where('user_id', $user->id)->pluck('role')->toArray();
        UserRole::where('user_id', $user->id)->delete();

        $roles = collect($data['roles'])->map(fn($role) => UserRole::create([
            'user_id' => $user->id,
            'role'    => $role,
        ]));

        AuditService::log('role_changed', 'user_roles', $userId,
            ['roles' => $oldRoles], ['roles' => $data['roles']],
            null, null, null, ['admin_action' => true]
        );

        return response()->json(['data' => $roles]);
    }

    // ─── Auth events (sourced from audit_log) ───

    public function authEvents(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 200);
        $eventType = $request->query('event_type');

        $actionMap = [
            'login_success' => ['login', true],
            'login_failure' => ['login', false],
            'lockout'       => ['login', false],
        ];

        $query = DB::table('audit_log')
            ->whereIn('action', ['login', 'logout'])
            ->orderByDesc('created_at');

        if ($eventType && $eventType !== 'all') {
            if (isset($actionMap[$eventType])) {
                [$action, $success] = $actionMap[$eventType];
                $query->where('action', $action)
                    ->whereRaw("json_extract(metadata, '$.success') = ?", [$success ? 'true' : 'false']);
            } elseif ($eventType === 'logout') {
                $query->where('action', 'logout');
            }
        }

        $rows = $query->limit($limit)->get()->map(function ($row) {
            $meta = json_decode($row->metadata ?? '{}', true);
            $success = $meta['success'] ?? null;
            $eventType = 'login_success';
            if ($row->action === 'logout') $eventType = 'logout';
            elseif ($success === false) $eventType = 'login_failure';

            return [
                'id'         => $row->id,
                'event_type' => $eventType,
                'email'      => $meta['email'] ?? null,
                'risk_level' => $success === false ? 'medium' : 'low',
                'ip_address' => $row->ip_address,
                'created_at' => $row->created_at,
            ];
        });

        return response()->json(['data' => $rows]);
    }

    public function loginLockouts(Request $request): JsonResponse
    {
        // Build lockout data from audit_log: count recent failures per email
        $since = now()->subHours(24)->toDateTimeString();
        $failures = DB::table('audit_log')
            ->where('action', 'login')
            ->whereRaw("json_extract(metadata, '$.success') = 'false'")
            ->where('created_at', '>=', $since)
            ->get();

        $byEmail = [];
        foreach ($failures as $row) {
            $meta = json_decode($row->metadata ?? '{}', true);
            $email = $meta['email'] ?? 'unknown';
            if (!isset($byEmail[$email])) {
                $byEmail[$email] = ['id' => $row->id, 'email' => $email, 'failed_attempts' => 0, 'last_attempt_at' => $row->created_at, 'locked_until' => null];
            }
            $byEmail[$email]['failed_attempts']++;
            if ($row->created_at > $byEmail[$email]['last_attempt_at']) {
                $byEmail[$email]['last_attempt_at'] = $row->created_at;
            }
        }

        // Consider locked if 5+ attempts in 24h
        foreach ($byEmail as &$entry) {
            if ($entry['failed_attempts'] >= 5) {
                $entry['locked_until'] = now()->addMinutes(15)->toIso8601String();
            }
        }

        $result = array_values(array_filter($byEmail, fn($e) => $e['failed_attempts'] > 0));
        usort($result, fn($a, $b) => $b['failed_attempts'] - $a['failed_attempts']);

        $limit = (int) $request->query('limit', 50);
        return response()->json(['data' => array_slice($result, 0, $limit)]);
    }

    // ─── Compliance ───

    public function consentRecords(Request $request): JsonResponse
    {
        $query = DB::table('consent_records')
            ->leftJoin('profiles as adult', 'consent_records.adult_profile_id', '=', 'adult.id')
            ->leftJoin('profiles as child', 'consent_records.child_profile_id', '=', 'child.id')
            ->select(
                'consent_records.*',
                'adult.display_name as adult_display_name',
                'child.display_name as child_display_name'
            )
            ->orderByDesc('consent_records.granted_at');

        $status = $request->query('status');
        if ($status === 'active') $query->whereNull('consent_records.revoked_at');
        if ($status === 'revoked') $query->whereNotNull('consent_records.revoked_at');

        $limit = (int) $request->query('limit', 200);
        $rows = $query->limit($limit)->get()->map(function ($row) {
            return [
                'id'            => $row->id,
                'consent_type'  => $row->consent_type,
                'granted_at'    => $row->granted_at,
                'revoked_at'    => $row->revoked_at,
                'revocation_reason' => $row->revocation_reason ?? null,
                'metadata'      => json_decode($row->metadata ?? '{}', true),
                'ip_metadata'   => json_decode($row->ip_metadata ?? '{}', true),
                'adult'         => ['display_name' => $row->adult_display_name],
                'child'         => ['display_name' => $row->child_display_name],
            ];
        });

        return response()->json(['data' => $rows]);
    }

    public function complianceStats(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'totalConsents'      => DB::table('consent_records')->count(),
                'totalAuditRecords'  => DB::table('audit_log')->count(),
            ],
        ]);
    }

    // ─── Banner clicks ───

    public function bannerClicks(Request $request): JsonResponse
    {
        // Return empty if no click tracking table exists
        if (!DB::getSchemaBuilder()->hasTable('banner_clicks')) {
            return response()->json(['data' => []]);
        }

        $clicks = DB::table('banner_clicks')
            ->select('banner_id', 'clicked_at')
            ->orderByDesc('clicked_at')
            ->limit(1000)
            ->get();

        return response()->json(['data' => $clicks]);
    }

    // ─── Onboarding analytics ───

    public function onboardingAnalytics(Request $request): JsonResponse
    {
        $rows = DB::table('onboarding_analytics')
            ->select('event_type', 'step_index', 'role', 'profile_id', 'created_at')
            ->orderByDesc('created_at')
            ->limit(5000)
            ->get();

        return response()->json(['data' => $rows]);
    }
}

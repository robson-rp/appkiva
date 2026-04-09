<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Must run AFTER the auth middleware.
 * Ensures the authenticated user's profile belongs to the resolved tenant,
 * preventing a user from one tenant accessing another tenant's data.
 */
class AssertTenantOwnership
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = session('tenant_id') ?? $request->header('X-Tenant-ID');

        if (! $tenantId) {
            return response()->json(['message' => 'Tenant not resolved.'], 401);
        }

        $user = $request->user();

        if ($user && $user->profile && $user->profile->tenant_id !== $tenantId) {
            return response()->json(['message' => 'Forbidden: user does not belong to this tenant.'], 403);
        }

        return $next($request);
    }
}

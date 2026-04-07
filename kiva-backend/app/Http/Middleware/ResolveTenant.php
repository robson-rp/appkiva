<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;

class ResolveTenant
{
    public function handle(Request $request, Closure $next): mixed
    {
        $tenantId = $request->header('X-Tenant-ID');

        if ($tenantId) {
            $tenant = Tenant::find($tenantId);
            if ($tenant && $tenant->is_active) {
                session(['tenant_id' => $tenantId]);
                app()->instance('current_tenant', $tenant);
            }
        } elseif ($request->getHost() !== 'localhost' && $request->getHost() !== '127.0.0.1') {
            $subdomain = explode('.', $request->getHost())[0];
            $tenant = Tenant::where('slug', $subdomain)->where('is_active', true)->first();
            if ($tenant) {
                session(['tenant_id' => $tenant->id]);
                app()->instance('current_tenant', $tenant);
            }
        }

        return $next($request);
    }
}

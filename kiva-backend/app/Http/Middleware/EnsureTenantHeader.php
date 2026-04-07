<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantHeader
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->header('X-Tenant-ID') && !session('tenant_id')) {
            return response()->json(['message' => 'Tenant header X-Tenant-ID is required.'], 400);
        }

        return $next($request);
    }
}

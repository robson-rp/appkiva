<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RoleRateLimit
{
    protected array $limits = [
        'child'   => 30,
        'teen'    => 60,
        'parent'  => 60,
        'teacher' => 100,
        'partner' => 100,
        'admin'   => 300,
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $role = $user?->roles->first()?->name ?? 'child';
        $limit = $this->limits[$role] ?? 60;
        $key = 'role_rl:' . ($user?->id ?? $request->ip());

        if (RateLimiter::tooManyAttempts($key, $limit)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => 'Too many requests.',
            ], 429)->withHeaders([
                'Retry-After' => $seconds,
                'X-RateLimit-Limit' => $limit,
                'X-RateLimit-Remaining' => 0,
            ]);
        }

        RateLimiter::hit($key, 60);

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdleTimeout
{
    protected array $timeouts = [
        'admin'   => 15,
        'parent'  => 30,
        'teacher' => 30,
        'partner' => 30,
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        $role = $user->roles->first()?->name ?? 'child';

        if (!isset($this->timeouts[$role])) {
            return $next($request);
        }

        $timeout = $this->timeouts[$role];
        $lastActivity = session('last_activity_at', now()->timestamp);

        if (now()->timestamp - $lastActivity > $timeout * 60) {
            session()->forget('last_activity_at');
            return response()->json(['message' => 'Session expired.', 'reason' => 'idle_timeout'], 401);
        }

        session(['last_activity_at' => now()->timestamp]);

        return $next($request);
    }
}

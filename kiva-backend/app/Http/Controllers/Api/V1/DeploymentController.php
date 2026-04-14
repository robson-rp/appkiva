<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class DeploymentController extends Controller
{
    public function hook(Request $request)
    {
        $token = $request->input('token');
        $expectedToken = config('app.deployment_token');

        if (!$expectedToken || !hash_equals($expectedToken, $token ?? '')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $output = [];

        try {
            Artisan::call('migrate', ['--force' => true]);
            $output[] = '[migrate] ' . Artisan::output();

            Artisan::call('storage:link');
            $output[] = '[storage:link] ' . Artisan::output();

            Artisan::call('config:cache');
            $output[] = '[config:cache] ' . Artisan::output();

            Artisan::call('route:cache');
            $output[] = '[route:cache] ' . Artisan::output();

            Artisan::call('view:cache');
            $output[] = '[view:cache] ' . Artisan::output();

            Artisan::call('event:cache');
            $output[] = '[event:cache] ' . Artisan::output();

            return response()->json([
                'status' => 'ok',
                'output' => implode("\n", $output),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'output' => implode("\n", $output),
            ], 500);
        }
    }
}

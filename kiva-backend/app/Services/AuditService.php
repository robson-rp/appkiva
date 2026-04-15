<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Str;

class AuditService
{
    public static function log(
        string $action,
        string $resourceType,
        ?string $resourceId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $profileId = null,
        ?string $userId = null,
        ?string $tenantId = null,
        ?array $metadata = null,
    ): void {
        try {
            // Try to get authenticated user context if not provided
            if (!$userId && auth()->check()) {
                $userId = auth()->id();
            }
            if (!$tenantId) {
                $tenantId = Request::header('X-Tenant-ID') ?: null;
            }

            DB::table('audit_log')->insert([
                'id'            => Str::uuid(),
                'action'        => $action,
                'resource_type' => $resourceType,
                'resource_id'   => $resourceId,
                'profile_id'    => $profileId,
                'user_id'       => $userId,
                'tenant_id'     => $tenantId,
                'old_values'    => $oldValues ? json_encode($oldValues) : null,
                'new_values'    => $newValues ? json_encode($newValues) : null,
                'metadata'      => $metadata ? json_encode($metadata) : null,
                'ip_address'    => Request::ip(),
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        } catch (\Throwable $e) {
            // Audit must never crash the main flow
            \Illuminate\Support\Facades\Log::warning('AuditService failed: ' . $e->getMessage());
        }
    }
}

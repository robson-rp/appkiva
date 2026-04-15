<?php

namespace App\Observers;

use App\Services\AuditService;

class UserRoleObserver
{
    public function created($model): void
    {
        AuditService::log('role_changed', 'user_roles', $model->id, null,
            ['user_id' => $model->user_id, 'role' => $model->role_name],
            null, null, null,
            ['operation' => 'assigned']
        );
    }

    public function deleted($model): void
    {
        AuditService::log('role_changed', 'user_roles', $model->id,
            ['user_id' => $model->user_id, 'role' => $model->role_name],
            null, null, null, null,
            ['operation' => 'revoked']
        );
    }
}

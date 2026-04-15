<?php

namespace App\Observers;

use App\Services\AuditService;

class TenantObserver
{
    public function created($model): void
    {
        AuditService::log('insert', 'tenants', $model->id, null, $model->toArray());
    }

    public function updated($model): void
    {
        $dirty = $model->getDirty();
        if (empty($dirty)) return;
        AuditService::log('update', 'tenants', $model->id,
            array_intersect_key($model->getOriginal(), $dirty),
            $dirty
        );
    }

    public function deleted($model): void
    {
        AuditService::log('delete', 'tenants', $model->id, ['name' => $model->name]);
    }
}

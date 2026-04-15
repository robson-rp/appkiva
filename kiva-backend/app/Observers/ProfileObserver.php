<?php

namespace App\Observers;

use App\Services\AuditService;

class ProfileObserver
{
    private static array $skipFields = ['updated_at'];

    public function created($model): void
    {
        AuditService::log('insert', 'profiles', $model->id, null,
            array_diff_key($model->toArray(), array_flip(['created_at', 'updated_at']))
        );
    }

    public function updated($model): void
    {
        $dirty = array_diff_key($model->getDirty(), array_flip(self::$skipFields));
        if (empty($dirty)) return;
        AuditService::log('update', 'profiles', $model->id,
            array_intersect_key($model->getOriginal(), $dirty),
            $dirty
        );
    }

    public function deleted($model): void
    {
        AuditService::log('delete', 'profiles', $model->id, ['display_name' => $model->display_name]);
    }
}

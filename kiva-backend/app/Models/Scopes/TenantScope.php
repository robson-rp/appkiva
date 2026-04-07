<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $tenantId = request()->header('X-Tenant-ID') ?? session('tenant_id');

        if ($tenantId) {
            $builder->where($model->getTenantIdColumn(), $tenantId);
        }
    }
}

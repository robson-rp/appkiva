<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Scopes models that don't have a direct tenant_id column but belong
 * to a Profile (or similar) that does. Uses a whereHas subquery.
 *
 * Usage in model:
 *   static::addGlobalScope(new TenantRelationScope('profile'));
 *   static::addGlobalScope(new TenantRelationScope('childProfile'));
 */
class TenantRelationScope implements Scope
{
    public function __construct(
        private readonly string $relation,
        private readonly string $tenantColumn = 'tenant_id',
    ) {}

    public function apply(Builder $builder, Model $model): void
    {
        $tenantId = request()->header('X-Tenant-ID') ?? session('tenant_id');

        if ($tenantId) {
            $builder->whereHas($this->relation, fn (Builder $q) =>
                $q->where($this->tenantColumn, $tenantId)
            );
        }
    }
}

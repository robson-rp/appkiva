<?php

namespace App\Interfaces;

interface Tenantable
{
    public function getTenantIdColumn(): string;
}

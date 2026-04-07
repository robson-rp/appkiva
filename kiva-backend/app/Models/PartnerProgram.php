<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerProgram extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'partner_tenant_id', 'program_name', 'program_type', 'status',
        'investment_amount', 'budget_spent', 'children_count',
        'target_household_id', 'target_tenant_id', 'started_at',
    ];

    protected function casts(): array
    {
        return [
            'investment_amount' => 'decimal:4',
            'budget_spent'      => 'decimal:4',
            'children_count'    => 'integer',
            'started_at'        => 'datetime',
        ];
    }

    public function invitations(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProgramInvitation::class, 'program_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramInvitation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'program_id', 'partner_tenant_id', 'code', 'status',
        'target_type', 'expires_at', 'accepted_by', 'accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at'  => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }

    public function program(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(PartnerProgram::class);
    }
}

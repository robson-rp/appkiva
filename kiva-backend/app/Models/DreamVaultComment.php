<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DreamVaultComment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['dream_vault_id', 'parent_profile_id', 'text', 'emoji'];

    public function dreamVault(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DreamVault::class);
    }

    public function parentProfile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'parent_profile_id');
    }
}

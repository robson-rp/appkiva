<?php

namespace App\Models;

use App\Models\Scopes\TenantRelationScope;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiaryEntry extends Model
{
    use HasFactory, HasUuids;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantRelationScope('profile'));
    }

    protected $fillable = ['profile_id', 'text', 'mood', 'tags'];

    protected function casts(): array
    {
        return ['tags' => 'array'];
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }
}

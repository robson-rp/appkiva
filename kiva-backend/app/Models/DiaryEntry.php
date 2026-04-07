<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiaryEntry extends Model
{
    use HasFactory, HasUuids;

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

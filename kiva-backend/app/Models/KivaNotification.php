<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KivaNotification extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'notifications';

    protected $fillable = [
        'profile_id', 'title', 'message', 'type', 'read', 'urgent', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'read'     => 'boolean',
            'urgent'   => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }
}

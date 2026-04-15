<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    use HasUuids;

    protected $fillable = [
        'event',
        'recipient_role',
        'title_template',
        'message_template',
        'icon',
        'is_urgent',
        'is_active',
        'cooldown_minutes',
    ];

    protected $casts = [
        'is_urgent'        => 'boolean',
        'is_active'        => 'boolean',
        'cooldown_minutes' => 'integer',
    ];
}

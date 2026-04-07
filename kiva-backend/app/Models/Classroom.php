<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name', 'description', 'grade', 'icon', 'schedule',
        'subject', 'teacher_profile_id', 'school_tenant_id',
    ];

    public function teacher(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Profile::class, 'teacher_profile_id');
    }

    public function students(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Profile::class, 'classroom_students', 'classroom_id', 'child_profile_id');
    }

    public function collectiveChallenges(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CollectiveChallenge::class);
    }
}

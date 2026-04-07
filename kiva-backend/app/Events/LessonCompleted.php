<?php

namespace App\Events;

use App\Models\LessonProgress;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LessonCompleted
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly LessonProgress $progress) {}
}

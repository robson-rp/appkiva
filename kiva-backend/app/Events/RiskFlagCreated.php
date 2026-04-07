<?php

namespace App\Events;

use App\Models\RiskFlag;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RiskFlagCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly RiskFlag $flag) {}
}

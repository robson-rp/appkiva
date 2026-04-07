<?php

namespace App\Listeners;

use App\Events\RiskFlagCreated;
use App\Jobs\SendRiskAlertJob;
use Illuminate\Contracts\Queue\ShouldQueue;

class HandleRiskFlagCreated implements ShouldQueue
{
    public function handle(RiskFlagCreated $event): void
    {
        if ($event->flag->severity === 'critical') {
            SendRiskAlertJob::dispatch($event->flag);
        }
    }
}

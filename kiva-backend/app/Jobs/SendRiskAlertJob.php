<?php

namespace App\Jobs;

use App\Models\RiskFlag;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendRiskAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly RiskFlag $flag) {}

    public function handle(): void
    {
        // In production: send email/notification to admins
        Log::critical('KIVARA Risk Alert', [
            'flag_id'   => $this->flag->id,
            'severity'  => $this->flag->severity,
            'flag_type' => $this->flag->flag_type,
            'profile_id' => $this->flag->profile_id,
        ]);
    }
}

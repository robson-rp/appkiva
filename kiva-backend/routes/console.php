<?php

use App\Jobs\AutoGenerateMissionsJob;
use App\Jobs\ProcessVaultInterestJob;
use App\Jobs\SendAllowanceJob;
use App\Models\AllowanceConfig;
use Illuminate\Support\Facades\Schedule;

// Weekly allowance payments (Sunday midnight)
Schedule::call(function () {
    AllowanceConfig::where('is_active', true)
        ->where('frequency', 'weekly')
        ->each(fn ($config) => SendAllowanceJob::dispatch($config));
})->weekly()->sundays()->at('00:05');

// Daily allowance payments
Schedule::call(function () {
    AllowanceConfig::where('is_active', true)
        ->where('frequency', 'daily')
        ->each(fn ($config) => SendAllowanceJob::dispatch($config));
})->daily()->at('00:10');

// Monthly allowance + vault interest (1st of month)
Schedule::call(function () {
    AllowanceConfig::where('is_active', true)
        ->where('frequency', 'monthly')
        ->each(fn ($config) => SendAllowanceJob::dispatch($config));
})->monthly()->at('00:15');

Schedule::job(new ProcessVaultInterestJob())->monthly()->at('01:00');

// Auto-generate missions every Monday
Schedule::job(new AutoGenerateMissionsJob())->weekly()->mondays()->at('06:00');

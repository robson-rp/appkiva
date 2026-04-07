<?php

namespace App\Jobs;

use App\Models\MissionTemplate;
use App\Models\Child;
use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AutoGenerateMissionsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $templates = MissionTemplate::where('is_active', true)->get();
        $week = now()->week;

        Child::with('profile')->each(function (Child $child) use ($templates, $week) {
            $ageGroup = $child->age_group;

            foreach ($templates as $template) {
                if ($template->age_group && $template->age_group !== $ageGroup) {
                    continue;
                }

                $exists = Mission::where('child_profile_id', $child->profile_id)
                    ->where('week', $week)
                    ->where('source', 'engine')
                    ->exists();

                if ($exists) {
                    continue;
                }

                Mission::create([
                    'child_profile_id'  => $child->profile_id,
                    'title'             => $template->title,
                    'description'       => $template->description,
                    'type'              => $template->type,
                    'difficulty'        => $template->difficulty,
                    'status'            => 'available',
                    'source'            => 'engine',
                    'reward'            => $template->reward_coins,
                    'kiva_points_reward' => $template->reward_points,
                    'target_amount'     => $template->target_amount,
                    'week'              => $week,
                    'is_auto_generated' => true,
                    'expires_at'        => now()->endOfWeek(),
                ]);
            }
        });
    }
}

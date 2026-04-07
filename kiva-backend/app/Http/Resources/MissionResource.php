<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'child_profile_id'  => $this->child_profile_id,
            'parent_profile_id' => $this->parent_profile_id,
            'household_id'      => $this->household_id,
            'title'             => $this->title,
            'description'       => $this->description,
            'type'              => $this->type,
            'difficulty'        => $this->difficulty,
            'status'            => $this->status,
            'source'            => $this->source,
            'reward'            => $this->reward,
            'kiva_points_reward' => $this->kiva_points_reward,
            'target_amount'     => $this->target_amount,
            'week'              => $this->week,
            'is_auto_generated' => $this->is_auto_generated,
            'expires_at'        => $this->expires_at,
            'completed_at'      => $this->completed_at,
            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,
        ];
    }
}

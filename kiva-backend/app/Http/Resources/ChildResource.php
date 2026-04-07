<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChildResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'profile_id'        => $this->profile_id,
            'parent_profile_id' => $this->parent_profile_id,
            'nickname'          => $this->nickname,
            'username'          => $this->username,
            'age_group'         => $this->age_group, // child or teen — NEVER date_of_birth
            'daily_spend_limit' => $this->daily_spend_limit,
            'monthly_budget'    => $this->monthly_budget,
            'school_tenant_id'  => $this->school_tenant_id,
            'profile'           => new UserProfileResource($this->whenLoaded('profile')),
            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,
            // pin_hash is NEVER included
            // date_of_birth is NEVER included
        ];
    }
}

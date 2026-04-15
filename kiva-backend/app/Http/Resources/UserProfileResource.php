<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'user_id'          => $this->user_id,
            'display_name'     => $this->display_name,
            'username'         => $this->username,
            'avatar'           => $this->avatar,
            'household_id'     => $this->household_id,
            'tenant_id'        => $this->tenant_id,
            'language'         => $this->language,
            'country'          => $this->country,
            'phone'            => $this->phone,
            'gender'           => $this->gender,
            'sector'           => $this->sector,
            'institution_name' => $this->institution_name,
            'ranking_visibility' => $this->ranking_visibility,
            'roles'            => $this->whenLoaded('user', fn() => $this->user->getRoleNames()),
            'household'        => $this->whenLoaded('household', fn() => $this->household ? ['id' => $this->household->id, 'name' => $this->household->name] : null),
            'tenant'           => $this->whenLoaded('tenant', fn() => $this->tenant ? ['id' => $this->tenant->id, 'name' => $this->tenant->name, 'tenant_type' => $this->tenant->tenant_type] : null),
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
            // date_of_birth is NEVER included here
        ];
    }
}

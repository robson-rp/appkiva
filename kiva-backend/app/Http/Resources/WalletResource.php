<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'profile_id'   => $this->profile_id,
            'wallet_type'  => $this->wallet_type,
            'currency'     => $this->currency,
            'balance'      => $this->balance, // Calculated via wallet_balances view
            'is_active'    => $this->is_active,
            'is_frozen'    => $this->is_frozen,
            'is_system'    => $this->is_system,
            'freeze_reason' => $this->freeze_reason,
            'frozen_at'    => $this->frozen_at,
            'created_at'   => $this->created_at,
            'updated_at'   => $this->updated_at,
        ];
    }
}

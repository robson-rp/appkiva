<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LedgerEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'credit_wallet_id' => $this->credit_wallet_id,
            'debit_wallet_id'  => $this->debit_wallet_id,
            'amount'           => $this->amount,
            'description'      => $this->description,
            'entry_type'       => $this->entry_type,
            'created_by'       => $this->created_by,
            'approved_by'      => $this->approved_by,
            'approved_at'      => $this->approved_at,
            'requires_approval' => $this->requires_approval,
            'idempotency_key'  => $this->idempotency_key,
            'reference_id'     => $this->reference_id,
            'reference_type'   => $this->reference_type,
            'metadata'         => $this->metadata,
            'created_at'       => $this->created_at,
        ];
    }
}

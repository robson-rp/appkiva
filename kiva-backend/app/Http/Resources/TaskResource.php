<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'child_profile_id'      => $this->child_profile_id,
            'parent_profile_id'     => $this->parent_profile_id,
            'household_id'          => $this->household_id,
            'title'                 => $this->title,
            'description'           => $this->description,
            'reward'                => $this->reward,
            'status'                => $this->status,
            'category'              => $this->category,
            'is_recurring'          => $this->is_recurring,
            'recurrence'            => $this->recurrence,
            'recurrence_source_id'  => $this->recurrence_source_id,
            'due_date'              => $this->due_date,
            'approved_at'           => $this->approved_at,
            'approved_by'           => $this->approved_by,
            'completed_at'          => $this->completed_at,
            'created_at'            => $this->created_at,
            'updated_at'            => $this->updated_at,
        ];
    }
}

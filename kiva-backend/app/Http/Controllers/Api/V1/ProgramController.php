<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PartnerProgram;
use App\Models\ProgramInvitation;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProgramController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile   = $request->user()->profile;
        $programs  = PartnerProgram::where('partner_tenant_id', $profile->tenant_id)->paginate(20);

        return response()->json(['data' => $programs->items(), 'meta' => ['total' => $programs->total()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'program_name'      => 'required|string|max:150',
            'program_type'      => 'nullable|string|max:100',
            'investment_amount' => 'nullable|numeric|min:0',
            'target_household_id' => 'nullable|uuid|exists:households,id',
            'target_tenant_id'  => 'nullable|uuid|exists:tenants,id',
        ]);

        $data['partner_tenant_id'] = $request->user()->profile->tenant_id;
        $data['started_at']        = now();

        $program = PartnerProgram::create($data);

        return response()->json(['data' => $program], 201);
    }

    public function show(Request $request, string $programId): JsonResponse
    {
        return response()->json(['data' => PartnerProgram::findOrFail($programId)]);
    }

    public function update(Request $request, string $programId): JsonResponse
    {
        $p = PartnerProgram::findOrFail($programId);

        $p->update($request->validate([
            'program_name' => 'nullable|string|max:150',
            'status'       => 'nullable|in:active,paused,ended',
        ]));

        return response()->json(['data' => $p->fresh()]);
    }

    public function destroy(Request $request, string $programId): JsonResponse
    {
        PartnerProgram::findOrFail($programId)->delete();

        return response()->json(null, 204);
    }

    public function invitations(Request $request, string $programId): JsonResponse
    {
        $invitations = ProgramInvitation::where('program_id', $programId)->get();

        return response()->json(['data' => $invitations]);
    }

    public function invite(Request $request, string $programId): JsonResponse
    {
        $program = PartnerProgram::findOrFail($programId);

        $data = $request->validate([
            'target_type' => 'nullable|in:family,school',
            'expires_days' => 'nullable|integer|min:1|max:365',
        ]);

        $invitation = ProgramInvitation::create([
            'program_id'        => $program->id,
            'partner_tenant_id' => $program->partner_tenant_id,
            'code'              => strtoupper(Str::random(10)),
            'target_type'       => $data['target_type'] ?? null,
            'expires_at'        => now()->addDays($data['expires_days'] ?? 30),
        ]);

        return response()->json(['data' => $invitation], 201);
    }

    public function acceptInvite(Request $request, string $code): JsonResponse
    {
        $invitation = ProgramInvitation::where('code', $code)->where('status', 'pending')->firstOrFail();

        if ($invitation->expires_at && $invitation->expires_at->isPast()) {
            $invitation->update(['status' => 'expired']);
            return response()->json(['message' => 'Invitation has expired.'], 410);
        }

        $profile = $request->user()->profile;

        $invitation->update([
            'status'      => 'accepted',
            'accepted_by' => $profile->id,
            'accepted_at' => now(),
        ]);

        return response()->json(['data' => $invitation->fresh()]);
    }
}

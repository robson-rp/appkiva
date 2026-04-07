<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Household;
use App\Models\HouseholdGuardian;
use App\Models\FamilyInviteCode;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HouseholdController extends Controller
{
    public function show(Request $request, string $household): JsonResponse
    {
        $h = Household::findOrFail($household);

        return response()->json(['data' => $h]);
    }

    public function update(Request $request, string $household): JsonResponse
    {
        $h = Household::findOrFail($household);

        $data = $request->validate([
            'name' => 'nullable|string|max:150',
            'monthly_emission_limit_override' => 'nullable|numeric|min:0',
        ]);

        $h->update($data);

        return response()->json(['data' => $h->fresh()]);
    }

    public function destroy(Request $request, string $household): JsonResponse
    {
        Household::findOrFail($household)->delete();

        return response()->json(null, 204);
    }

    public function guardians(Request $request, string $household): JsonResponse
    {
        $h = Household::findOrFail($household);
        $guardians = HouseholdGuardian::with('profile.user')->where('household_id', $h->id)->get();

        return response()->json(['data' => $guardians]);
    }

    public function generateInvite(Request $request, string $household): JsonResponse
    {
        $h = Household::findOrFail($household);

        $invite = FamilyInviteCode::create([
            'household_id' => $h->id,
            'created_by'   => $request->user()->profile->id,
            'code'         => strtoupper(Str::random(8)),
            'status'       => 'active',
            'expires_at'   => now()->addDays(7),
        ]);

        return response()->json(['data' => $invite], 201);
    }

    public function acceptInvite(Request $request, string $code): JsonResponse
    {
        $invite = FamilyInviteCode::where('code', $code)->where('status', 'active')->firstOrFail();

        if ($invite->expires_at && $invite->expires_at->isPast()) {
            $invite->update(['status' => 'expired']);
            return response()->json(['message' => 'Invite code has expired.'], 410);
        }

        $profile = $request->user()->profile;

        HouseholdGuardian::firstOrCreate(
            ['household_id' => $invite->household_id, 'profile_id' => $profile->id],
            ['role' => 'guardian', 'permission_level' => 'limited', 'invited_by' => $invite->created_by]
        );

        $profile->update(['household_id' => $invite->household_id]);

        $invite->update(['status' => 'used', 'used_by' => $profile->id, 'used_at' => now()]);

        return response()->json(['data' => Household::find($invite->household_id)]);
    }
}

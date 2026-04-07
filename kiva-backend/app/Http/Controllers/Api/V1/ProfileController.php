<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserProfileResource;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request, string $id): JsonResponse
    {
        $profile = Profile::findOrFail($id);

        return response()->json(['data' => new UserProfileResource($profile->load('user'))]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $profile = Profile::findOrFail($id);

        if ($request->user()->profile->id !== $id) {
            abort(403);
        }

        $data = $request->validate([
            'display_name'      => 'nullable|string|max:100',
            'username'          => 'nullable|string|max:50|unique:profiles,username,' . $id,
            'avatar'            => 'nullable|string|max:500',
            'language'          => 'nullable|string|max:5',
            'country'           => 'nullable|string|max:2',
            'phone'             => 'nullable|string|max:30',
            'gender'            => 'nullable|string|max:20',
            'ranking_visibility' => 'nullable|boolean',
            'email_preferences' => 'nullable|array',
        ]);

        $profile->update($data);

        return response()->json(['data' => new UserProfileResource($profile->fresh()->load('user'))]);
    }
}

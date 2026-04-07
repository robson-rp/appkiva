<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DiaryEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiaryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $entries = DiaryEntry::where('profile_id', $profile->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['data' => $entries->items(), 'meta' => ['total' => $entries->total()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'text' => 'required|string|max:5000',
            'mood' => 'nullable|string|max:50',
            'tags' => 'nullable|array',
        ]);

        $data['profile_id'] = $request->user()->profile->id;

        $entry = DiaryEntry::create($data);

        return response()->json(['data' => $entry], 201);
    }

    public function show(Request $request, string $diary): JsonResponse
    {
        $entry = DiaryEntry::findOrFail($diary);

        if ($entry->profile_id !== $request->user()->profile->id) {
            abort(403);
        }

        return response()->json(['data' => $entry]);
    }

    public function update(Request $request, string $diary): JsonResponse
    {
        $entry = DiaryEntry::findOrFail($diary);

        if ($entry->profile_id !== $request->user()->profile->id) {
            abort(403);
        }

        $data = $request->validate([
            'text' => 'nullable|string|max:5000',
            'mood' => 'nullable|string|max:50',
            'tags' => 'nullable|array',
        ]);

        $entry->update($data);

        return response()->json(['data' => $entry->fresh()]);
    }

    public function destroy(Request $request, string $diary): JsonResponse
    {
        $entry = DiaryEntry::findOrFail($diary);

        if ($entry->profile_id !== $request->user()->profile->id) {
            abort(403);
        }

        $entry->delete();

        return response()->json(null, 204);
    }
}

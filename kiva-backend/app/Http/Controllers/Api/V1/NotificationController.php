<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\KivaNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $notifications = KivaNotification::where('profile_id', $profile->id)
            ->orderByDesc('created_at')
            ->paginate(30);

        return response()->json([
            'data' => $notifications->items(),
            'meta' => ['total' => $notifications->total(), 'unread' => KivaNotification::where('profile_id', $profile->id)->where('read', false)->count()],
        ]);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        $n = KivaNotification::where('id', $id)
            ->where('profile_id', $request->user()->profile->id)
            ->firstOrFail();

        $n->update(['read' => true]);

        return response()->json(['data' => $n->fresh()]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        KivaNotification::where('profile_id', $profile->id)->update(['read' => true]);

        return response()->json(null, 204);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        KivaNotification::where('id', $id)
            ->where('profile_id', $request->user()->profile->id)
            ->firstOrFail()
            ->delete();

        return response()->json(null, 204);
    }

    public function getSettings(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        return response()->json(['data' => $profile->email_preferences ?? (object) []]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $settings = $request->validate([
            '*' => 'nullable',
        ]);

        $profile->update(['email_preferences' => $request->all()]);

        return response()->json(['data' => $profile->fresh()->email_preferences ?? (object) []]);
    }

    public function markReadPut(Request $request, string $id): JsonResponse
    {
        $n = KivaNotification::where('id', $id)
            ->where('profile_id', $request->user()->profile->id)
            ->firstOrFail();

        $n->update(['read' => true]);

        return response()->json(['data' => $n->fresh()]);
    }
}

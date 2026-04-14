<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Events\LessonCompleted;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Jobs\CheckBadgeUnlockJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $lessons = Lesson::where('is_active', true)
            ->when($request->difficulty, fn($q, $d) => $q->where('difficulty', $d))
            ->when($request->category, fn($q, $c) => $q->where('category', $c))
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $lessons]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'              => 'required|string|max:255',
            'description'        => 'nullable|string|max:1000',
            'category'           => 'required|string|max:100',
            'difficulty'         => 'nullable|in:beginner,explorer,saver,strategist,master',
            'estimated_minutes'  => 'nullable|integer|min:1',
            'icon'               => 'nullable|string|max:255',
            'blocks'             => 'required|array',
            'quiz'               => 'nullable|array',
            'kiva_points_reward' => 'nullable|integer|min:0',
            'sort_order'         => 'nullable|integer|min:0',
        ]);

        $lesson = Lesson::create($data);

        return response()->json(['data' => $lesson], 201);
    }

    public function show(Request $request, string $lesson): JsonResponse
    {
        return response()->json(['data' => Lesson::findOrFail($lesson)]);
    }

    public function update(Request $request, string $lesson): JsonResponse
    {
        $l = Lesson::findOrFail($lesson);

        $l->update($request->validate([
            'title'              => 'nullable|string|max:255',
            'blocks'             => 'nullable|array',
            'quiz'               => 'nullable|array',
            'kiva_points_reward' => 'nullable|integer|min:0',
            'sort_order'         => 'nullable|integer|min:0',
        ]));

        return response()->json(['data' => $l->fresh()]);
    }

    public function toggleActive(Request $request, string $lesson): JsonResponse
    {
        $l = Lesson::findOrFail($lesson);
        $l->update(['is_active' => !$l->is_active]);

        return response()->json(['data' => $l->fresh()]);
    }

    public function destroy(Request $request, string $lesson): JsonResponse
    {
        Lesson::findOrFail($lesson)->delete();

        return response()->json(null, 204);
    }

    public function getProgress(Request $request, string $lesson): JsonResponse
    {
        $profile = $request->user()->profile;

        $progress = LessonProgress::where('lesson_id', $lesson)
            ->where('profile_id', $profile->id)
            ->first();

        return response()->json(['data' => $progress]);
    }

    public function recordProgress(Request $request, string $lesson): JsonResponse
    {
        $l = Lesson::findOrFail($lesson);
        $profile = $request->user()->profile;

        $data = $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
        ]);

        $existing = LessonProgress::where('lesson_id', $l->id)
            ->where('profile_id', $profile->id)
            ->first();

        if ($existing) {
            return response()->json(['data' => $existing]);
        }

        $progress = LessonProgress::create([
            'lesson_id'          => $l->id,
            'profile_id'         => $profile->id,
            'score'              => $data['score'] ?? null,
            'kiva_points_earned' => $l->kiva_points_reward,
            'completed_at'       => now(),
        ]);

        event(new LessonCompleted($progress));
        CheckBadgeUnlockJob::dispatch($profile->id);

        return response()->json(['data' => $progress], 201);
    }

    public function allProgress(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $progress = LessonProgress::with('lesson')
            ->where('profile_id', $profile->id)
            ->paginate(20);

        return response()->json([
            'data' => $progress->items(),
            'meta' => [
                'total'        => $progress->total(),
                'per_page'     => $progress->perPage(),
                'current_page' => $progress->currentPage(),
                'last_page'    => $progress->lastPage(),
            ],
        ]);
    }

    public function complete(Request $request, string $lesson): JsonResponse
    {
        $l = Lesson::findOrFail($lesson);
        $profile = $request->user()->profile;

        $data = $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
        ]);

        $existing = LessonProgress::where('lesson_id', $l->id)
            ->where('profile_id', $profile->id)
            ->first();

        if ($existing) {
            return response()->json(['data' => $existing]);
        }

        $progress = LessonProgress::create([
            'lesson_id'          => $l->id,
            'profile_id'         => $profile->id,
            'score'              => $data['score'] ?? null,
            'kiva_points_earned' => $l->kiva_points_reward,
            'completed_at'       => now(),
        ]);

        event(new LessonCompleted($progress));
        CheckBadgeUnlockJob::dispatch($profile->id);

        return response()->json(['data' => $progress]);
    }
}

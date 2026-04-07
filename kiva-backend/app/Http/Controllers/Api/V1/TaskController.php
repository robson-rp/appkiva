<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(private readonly TaskService $taskService) {}

    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $tasks = Task::where(function ($q) use ($profile) {
            $q->where('child_profile_id', $profile->id)
              ->orWhere('parent_profile_id', $profile->id);
        })
        ->when($request->status, fn($q, $s) => $q->where('status', $s))
        ->orderByDesc('created_at')
        ->paginate(20);

        return response()->json([
            'data' => TaskResource::collection($tasks->items()),
            'meta' => ['total' => $tasks->total(), 'current_page' => $tasks->currentPage(), 'last_page' => $tasks->lastPage()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $data = $request->validate([
            'child_profile_id' => 'required|uuid|exists:profiles,id',
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string|max:1000',
            'reward'           => 'nullable|numeric|min:0',
            'category'         => 'nullable|in:cleaning,studying,helping,other',
            'is_recurring'     => 'nullable|boolean',
            'recurrence'       => 'nullable|string|max:50',
            'due_date'         => 'nullable|date',
        ]);

        $data['parent_profile_id'] = $profile->id;
        $data['household_id']      = $profile->household_id;

        $task = Task::create($data);

        return response()->json(['data' => new TaskResource($task)], 201);
    }

    public function show(Request $request, string $task): JsonResponse
    {
        $t = Task::findOrFail($task);

        return response()->json(['data' => new TaskResource($t)]);
    }

    public function update(Request $request, string $task): JsonResponse
    {
        $t = Task::findOrFail($task);

        $data = $request->validate([
            'title'       => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'reward'      => 'nullable|numeric|min:0',
            'category'    => 'nullable|in:cleaning,studying,helping,other',
            'due_date'    => 'nullable|date',
            'status'      => 'nullable|in:pending,in_progress,completed,approved',
        ]);

        $t->update($data);

        return response()->json(['data' => new TaskResource($t->fresh())]);
    }

    public function destroy(Request $request, string $task): JsonResponse
    {
        Task::findOrFail($task)->delete();

        return response()->json(null, 204);
    }

    public function approve(Request $request, string $task): JsonResponse
    {
        $t = Task::findOrFail($task);
        $profile = $request->user()->profile;

        try {
            $t = $this->taskService->approve($t, $profile->id);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => new TaskResource($t)]);
    }

    public function reject(Request $request, string $task): JsonResponse
    {
        $t = Task::findOrFail($task);
        $t->update(['status' => 'pending']);

        return response()->json(['data' => new TaskResource($t->fresh())]);
    }

    public function complete(Request $request, string $task): JsonResponse
    {
        $t = Task::findOrFail($task);
        $t->update(['status' => 'completed', 'completed_at' => now()]);

        return response()->json(['data' => new TaskResource($t->fresh())]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\CollectiveChallenge;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    public function indexClassrooms(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $classrooms = Classroom::where('school_tenant_id', $profile->tenant_id)
            ->orWhere('teacher_profile_id', $profile->id)
            ->paginate(20);

        return response()->json(['data' => $classrooms->items(), 'meta' => ['total' => $classrooms->total()]]);
    }

    public function storeClassroom(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:150',
            'grade'    => 'nullable|string|max:50',
            'icon'     => 'nullable|string|max:255',
            'schedule' => 'nullable|string|max:255',
            'subject'  => 'nullable|string|max:100',
        ]);

        $profile = $request->user()->profile;
        $data['teacher_profile_id'] = $profile->id;
        $data['school_tenant_id']   = $profile->tenant_id;

        $classroom = Classroom::create($data);

        return response()->json(['data' => $classroom], 201);
    }

    public function showClassroom(Request $request, string $id): JsonResponse
    {
        return response()->json(['data' => Classroom::with('students')->findOrFail($id)]);
    }

    public function updateClassroom(Request $request, string $id): JsonResponse
    {
        $c = Classroom::findOrFail($id);

        $c->update($request->validate([
            'name'     => 'nullable|string|max:150',
            'grade'    => 'nullable|string|max:50',
            'schedule' => 'nullable|string|max:255',
            'subject'  => 'nullable|string|max:100',
        ]));

        return response()->json(['data' => $c->fresh()]);
    }

    public function destroyClassroom(Request $request, string $id): JsonResponse
    {
        Classroom::findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    public function students(Request $request, string $id): JsonResponse
    {
        $classroom = Classroom::with('students.user')->findOrFail($id);

        return response()->json(['data' => $classroom->students]);
    }

    public function addStudent(Request $request, string $id, string $childId): JsonResponse
    {
        $classroom = Classroom::findOrFail($id);
        $profile   = Profile::findOrFail($childId);

        $classroom->students()->syncWithoutDetaching([$profile->id]);

        return response()->json(null, 204);
    }

    public function removeStudent(Request $request, string $id, string $childId): JsonResponse
    {
        $classroom = Classroom::findOrFail($id);

        $classroom->students()->detach($childId);

        return response()->json(null, 204);
    }

    public function schoolStudents(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $students = Profile::whereHas('child', fn($q) => $q->where('school_tenant_id', $profile->tenant_id))
            ->get();

        return response()->json(['data' => $students]);
    }

    public function classroomChallenges(Request $request, string $classroomId): JsonResponse
    {
        Classroom::findOrFail($classroomId);

        $challenges = CollectiveChallenge::where('classroom_id', $classroomId)
            ->paginate(20);

        return response()->json([
            'data' => $challenges->items(),
            'meta' => [
                'total'        => $challenges->total(),
                'per_page'     => $challenges->perPage(),
                'current_page' => $challenges->currentPage(),
                'last_page'    => $challenges->lastPage(),
            ],
        ]);
    }

    public function storeClassroomChallenge(Request $request, string $classroomId): JsonResponse
    {
        Classroom::findOrFail($classroomId);

        $data = $request->validate([
            'title'              => 'required|string|max:255',
            'description'        => 'nullable|string|max:1000',
            'type'               => 'nullable|string|max:50',
            'reward'             => 'nullable|numeric|min:0',
            'kiva_points_reward' => 'nullable|integer|min:0',
            'target_amount'      => 'nullable|numeric|min:0',
            'start_date'         => 'nullable|date',
            'end_date'           => 'nullable|date|after_or_equal:start_date',
        ]);

        $data['classroom_id']        = $classroomId;
        $data['teacher_profile_id']  = $request->user()->profile->id;

        $challenge = CollectiveChallenge::create($data);

        return response()->json(['data' => $challenge], 201);
    }
}

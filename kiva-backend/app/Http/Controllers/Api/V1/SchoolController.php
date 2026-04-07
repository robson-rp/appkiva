<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
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
}

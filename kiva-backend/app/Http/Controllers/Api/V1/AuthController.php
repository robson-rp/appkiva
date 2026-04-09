<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserProfileResource;
use App\Models\TrustedDevice;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'            => 'required|email|unique:users,email',
            'password'         => ['required', PasswordRule::min(8)],
            'display_name'     => 'required|string|max:100',
            'username'         => 'nullable|string|max:50|unique:profiles,username',
            'role'             => 'nullable|in:parent,teacher,partner',
            'language'         => 'nullable|string|max:5',
            'country'          => 'nullable|string|max:2',
            'phone'            => 'nullable|string|max:30',
            'gender'           => 'nullable|string|max:20',
            'sector'           => 'nullable|string|max:100',
            'institution_name' => 'nullable|string|max:255',
            'household_name'   => 'nullable|string|max:100',
            'tenant_id'        => 'nullable|uuid|exists:tenants,id',
        ]);

        $result = $this->authService->register($data);

        return response()->json([
            'data'  => new UserProfileResource($result['profile']->load('user')),
            'token' => $result['token'],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $key = 'login:' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => 'Too many login attempts.',
            ], 429)->withHeaders(['Retry-After' => $seconds]);
        }

        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $result = $this->authService->login($data['email'], $data['password']);

        if (!$result) {
            RateLimiter::hit($key, 60);
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        RateLimiter::clear($key);

        return response()->json([
            'token'         => $result['token'],
            'refresh_token' => $result['refresh_token'],
            'profile'       => new UserProfileResource($result['user']->profile?->load('user')),
        ]);
    }

    public function childLogin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username'     => 'required|string',
            'pin'          => 'required|string|min:4|max:8',
            'household_id' => 'required|uuid',
        ]);

        $result = $this->authService->childLogin(
            $data['username'],
            $data['pin'],
            $data['household_id']
        );

        if (!$result) {
            return response()->json(['message' => 'Invalid username, PIN, or household.'], 401);
        }

        return response()->json([
            'token'   => $result['token'],
            'profile' => new UserProfileResource($result['profile']->load('user')),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout();

        return response()->json(null, 204);
    }

    public function refresh(Request $request): JsonResponse
    {
        $data = $request->validate([
            'refresh_token' => 'required|string',
        ]);

        $token = $this->authService->refresh($data['refresh_token']);

        if (!$token) {
            return response()->json(['message' => 'Invalid or expired refresh token.'], 401);
        }

        return response()->json(['token' => $token]);
    }

    public function me(Request $request): JsonResponse
    {
        $profile = $request->user()->profile?->load('user');

        return response()->json([
            'data' => new UserProfileResource($profile),
        ]);
    }

    public function updateMe(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $data = $request->validate([
            'display_name'     => 'nullable|string|max:100',
            'username'         => 'nullable|string|max:50|unique:profiles,username,' . $profile->id,
            'avatar'           => 'nullable|string|max:500',
            'language'         => 'nullable|string|max:5',
            'country'          => 'nullable|string|max:2',
            'phone'            => 'nullable|string|max:30',
            'gender'           => 'nullable|string|max:20',
            'ranking_visibility' => 'nullable|boolean',
            'email_preferences' => 'nullable|array',
        ]);

        $profile->update(array_map('strip_tags', array_filter($data, 'is_string')) + array_filter($data, fn($v) => !is_string($v)));

        return response()->json([
            'data' => new UserProfileResource($profile->fresh()->load('user')),
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        Password::sendResetLink($request->only('email'));

        return response()->json(null, 204);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => ['required', PasswordRule::min(8)],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill(['password' => $password])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)], 400);
        }

        return response()->json(null, 204);
    }

    public function addTrustedDevice(Request $request): JsonResponse
    {
        $data = $request->validate([
            'device_token'  => 'required|string|max:500',
            'device_name'   => 'nullable|string|max:255',
            'trusted_until' => 'nullable|date',
        ]);

        $data['user_id'] = $request->user()->id;

        $device = TrustedDevice::updateOrCreate(
            ['device_token' => $data['device_token']],
            $data + ['last_used_at' => now()]
        );

        return response()->json(['data' => $device], 201);
    }

    public function removeTrustedDevice(Request $request, string $deviceToken): JsonResponse
    {
        $device = TrustedDevice::where('device_token', $deviceToken)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $device->delete();

        return response()->json(null, 204);
    }
}

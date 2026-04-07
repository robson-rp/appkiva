<?php

use App\Models\User;
use App\Models\Profile;
use App\Models\Household;
use App\Models\HouseholdGuardian;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('registers a new parent user and returns a JWT token', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'email'        => 'test@example.com',
        'password'     => 'Password123!',
        'display_name' => 'Test Parent',
        'role'         => 'parent',
    ]);

    $response->assertStatus(201)
             ->assertJsonStructure([
                 'data' => ['id', 'user_id', 'display_name'],
                 'token',
             ]);

    expect(User::where('email', 'test@example.com')->exists())->toBeTrue();
    expect(Profile::where('display_name', 'Test Parent')->exists())->toBeTrue();
});

it('returns 422 when email is already taken', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->postJson('/api/v1/auth/register', [
        'email'        => 'taken@example.com',
        'password'     => 'Password123!',
        'display_name' => 'Another User',
    ])->assertStatus(422);
});

it('logs in with valid credentials and returns tokens', function () {
    User::factory()->create([
        'email'    => 'login@example.com',
        'password' => bcrypt('Password123!'),
    ]);

    $this->postJson('/api/v1/auth/login', [
        'email'    => 'login@example.com',
        'password' => 'Password123!',
    ])->assertStatus(200)
      ->assertJsonStructure(['token', 'refresh_token']);
});

it('returns 401 with wrong password', function () {
    User::factory()->create([
        'email'    => 'wrong@example.com',
        'password' => bcrypt('correct'),
    ]);

    $this->postJson('/api/v1/auth/login', [
        'email'    => 'wrong@example.com',
        'password' => 'wrong',
    ])->assertStatus(401);
});

it('returns authenticated user profile on /me', function () {
    $user = User::factory()->create();
    $household = Household::factory()->create();
    $profile = Profile::factory()->create(['user_id' => $user->id, 'household_id' => $household->id]);

    $this->actingAs($user)->getJson('/api/v1/auth/me')
         ->assertStatus(200)
         ->assertJsonPath('data.user_id', $user->id);
});

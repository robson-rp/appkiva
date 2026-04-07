<?php

use App\Models\User;
use App\Models\Profile;
use App\Models\Child;
use App\Models\Household;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('parent can create a child and wallets are auto-created', function () {
    $parent = User::factory()->create();
    $household = Household::factory()->create();
    $parentProfile = Profile::factory()->create(['user_id' => $parent->id, 'household_id' => $household->id]);
    $parent->assignRole('parent');

    $response = $this->actingAs($parent)->postJson('/api/v1/children', [
        'display_name' => 'Little One',
        'username'     => 'little_one',
        'pin'          => '1234',
    ]);

    $response->assertStatus(201)
             ->assertJsonPath('data.nickname', null);

    $childProfile = Profile::where('display_name', 'Little One')->first();
    expect($childProfile)->not->toBeNull();

    $wallets = Wallet::where('profile_id', $childProfile->id)->get();
    expect($wallets)->toHaveCount(2);
    expect($wallets->pluck('wallet_type')->sort()->values()->toArray())->toBe(['real', 'virtual']);
});

it('response never includes date_of_birth or pin_hash', function () {
    $parent = User::factory()->create();
    $parentProfile = Profile::factory()->create(['user_id' => $parent->id]);
    $parent->assignRole('parent');

    $response = $this->actingAs($parent)->postJson('/api/v1/children', [
        'display_name'  => 'Secret Child',
        'pin'           => '9999',
        'date_of_birth' => '2015-06-15',
    ]);

    $response->assertStatus(201);

    $body = $response->json();
    $flat = json_encode($body);

    expect($flat)->not->toContain('date_of_birth')
                 ->not->toContain('pin_hash')
                 ->not->toContain('2015-06-15');
});

it('child profile cannot be accessed by non-household user', function () {
    $outsider = User::factory()->create();
    $outsider->assignRole('parent');
    Profile::factory()->create(['user_id' => $outsider->id]);

    $child = Child::factory()->create();

    $this->actingAs($outsider)->getJson('/api/v1/children/' . $child->id)
         ->assertStatus(403);
});

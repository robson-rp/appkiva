<?php

use App\Services\WalletService;

it('WalletService is resolvable from the container', function () {
    expect(app(WalletService::class))->toBeInstanceOf(WalletService::class);
});

it('ChildService is resolvable from the container', function () {
    expect(app(\App\Services\ChildService::class))->toBeInstanceOf(\App\Services\ChildService::class);
});

it('AuthService is resolvable from the container', function () {
    expect(app(\App\Services\AuthService::class))->toBeInstanceOf(\App\Services\AuthService::class);
});

it('TaskService is resolvable from the container', function () {
    expect(app(\App\Services\TaskService::class))->toBeInstanceOf(\App\Services\TaskService::class);
});

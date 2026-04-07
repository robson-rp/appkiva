<?php

use App\Models\User;
use App\Models\Profile;
use App\Models\Wallet;
use App\Models\LedgerEntry;
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('wallet balance is calculated from ledger entries (double-entry)', function () {
    $profile = Profile::factory()->create();
    $wallet  = Wallet::factory()->create(['profile_id' => $profile->id, 'wallet_type' => 'virtual']);

    // Credit 50
    LedgerEntry::create([
        'credit_wallet_id' => $wallet->id,
        'amount'           => '50.0000',
        'entry_type'       => 'allowance',
    ]);

    // Credit 20 more
    LedgerEntry::create([
        'credit_wallet_id' => $wallet->id,
        'amount'           => '20.0000',
        'entry_type'       => 'task_reward',
    ]);

    // Debit 10
    LedgerEntry::create([
        'debit_wallet_id' => $wallet->id,
        'amount'          => '10.0000',
        'entry_type'      => 'purchase',
    ]);

    expect((float) $wallet->fresh()->balance)->toBe(60.0);
});

it('throws when wallet has insufficient balance', function () {
    $profile = Profile::factory()->create();
    $wallet  = Wallet::factory()->create(['profile_id' => $profile->id, 'wallet_type' => 'virtual']);

    $service = app(WalletService::class);

    expect(fn() => $service->createTransaction([
        'debit_wallet_id' => $wallet->id,
        'amount'          => '100.0000',
        'entry_type'      => 'purchase',
    ]))->toThrow(\RuntimeException::class, 'Insufficient balance');
});

it('throws when wallet is frozen', function () {
    $profile = Profile::factory()->create();
    $wallet  = Wallet::factory()->create([
        'profile_id' => $profile->id,
        'wallet_type' => 'virtual',
        'is_frozen'   => true,
        'freeze_reason' => 'test freeze',
    ]);

    // Credit first so balance isn't the issue
    LedgerEntry::create(['credit_wallet_id' => $wallet->id, 'amount' => '100', 'entry_type' => 'allowance']);

    $service = app(WalletService::class);

    expect(fn() => $service->createTransaction([
        'debit_wallet_id' => $wallet->id,
        'amount'          => '10.0000',
        'entry_type'      => 'purchase',
    ]))->toThrow(\RuntimeException::class, 'frozen');
});

it('idempotency_key prevents duplicate ledger entries', function () {
    $profile = Profile::factory()->create();
    $wallet  = Wallet::factory()->create(['profile_id' => $profile->id, 'wallet_type' => 'virtual']);
    $service = app(WalletService::class);

    $entry1 = $service->createTransaction([
        'credit_wallet_id' => $wallet->id,
        'amount'           => '10.0000',
        'entry_type'       => 'allowance',
        'idempotency_key'  => 'test-key-123',
    ]);

    $entry2 = $service->createTransaction([
        'credit_wallet_id' => $wallet->id,
        'amount'           => '10.0000',
        'entry_type'       => 'allowance',
        'idempotency_key'  => 'test-key-123',
    ]);

    expect($entry1->id)->toBe($entry2->id);
    expect(LedgerEntry::where('idempotency_key', 'test-key-123')->count())->toBe(1);
});

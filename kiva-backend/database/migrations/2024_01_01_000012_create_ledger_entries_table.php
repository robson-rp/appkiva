<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('credit_wallet_id')->nullable()->index();
            $table->uuid('debit_wallet_id')->nullable()->index();
            $table->decimal('amount', 15, 4);
            $table->string('description')->nullable();
            $table->enum('entry_type', [
                'allowance', 'task_reward', 'mission_reward', 'purchase',
                'donation', 'vault_deposit', 'vault_withdraw', 'vault_interest',
                'transfer', 'adjustment', 'refund',
            ]);
            $table->uuid('created_by')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->boolean('requires_approval')->default(false);
            $table->string('idempotency_key')->unique()->nullable();
            $table->uuid('reference_id')->nullable();
            $table->string('reference_type')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->foreign('credit_wallet_id')->references('id')->on('wallets')->onDelete('set null');
            $table->foreign('debit_wallet_id')->references('id')->on('wallets')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_entries');
    }
};

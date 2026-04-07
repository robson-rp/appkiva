<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->enum('wallet_type', ['virtual', 'real']);
            $table->string('currency', 3)->default('EUR');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_frozen')->default(false);
            $table->boolean('is_system')->default(false);
            $table->string('freeze_reason')->nullable();
            $table->timestamp('frozen_at')->nullable();
            $table->uuid('frozen_by')->nullable();
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};

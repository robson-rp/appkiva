<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('family_invite_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('household_id')->index();
            $table->uuid('created_by')->nullable();
            $table->string('code')->unique();
            $table->enum('status', ['active', 'used', 'expired'])->default('active');
            $table->timestamp('expires_at')->nullable();
            $table->uuid('used_by')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
            $table->foreign('household_id')->references('id')->on('households')->onDelete('cascade');
        });

        Schema::create('referral_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->string('code')->unique();
            $table->integer('uses_count')->default(0);
            $table->integer('max_uses')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('referral_claims', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('referral_code_id')->index();
            $table->uuid('claimed_by_profile_id')->index();
            $table->decimal('reward_amount', 15, 4)->nullable();
            $table->timestamp('claimed_at');
            $table->timestamps();
            $table->foreign('referral_code_id')->references('id')->on('referral_codes')->onDelete('cascade');
            $table->foreign('claimed_by_profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_claims');
        Schema::dropIfExists('referral_codes');
        Schema::dropIfExists('family_invite_codes');
    }
};

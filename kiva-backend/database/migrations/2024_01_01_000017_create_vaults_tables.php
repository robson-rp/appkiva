<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('savings_vaults', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->uuid('household_id')->nullable()->index();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->decimal('current_amount', 15, 4)->default(0);
            $table->decimal('target_amount', 15, 4)->nullable();
            $table->decimal('interest_rate', 8, 4)->nullable();
            $table->boolean('requires_parent_approval')->default(false);
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('dream_vaults', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->uuid('household_id')->nullable()->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->integer('priority')->nullable();
            $table->decimal('current_amount', 15, 4)->default(0);
            $table->decimal('target_amount', 15, 4)->nullable();
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('dream_vault_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('dream_vault_id')->index();
            $table->uuid('parent_profile_id')->index();
            $table->text('text');
            $table->string('emoji', 10)->nullable();
            $table->timestamps();
            $table->foreign('dream_vault_id')->references('id')->on('dream_vaults')->onDelete('cascade');
            $table->foreign('parent_profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dream_vault_comments');
        Schema::dropIfExists('dream_vaults');
        Schema::dropIfExists('savings_vaults');
    }
};

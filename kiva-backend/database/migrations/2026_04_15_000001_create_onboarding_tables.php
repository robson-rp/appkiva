<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('onboarding_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->unique()->index();
            $table->integer('current_step')->default(0);
            $table->boolean('completed')->default(false);
            $table->boolean('skipped')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('onboarding_analytics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->string('event_type', 50); // view, complete, skip
            $table->integer('step_index')->default(0);
            $table->string('role', 30)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding_analytics');
        Schema::dropIfExists('onboarding_progress');
    }
};

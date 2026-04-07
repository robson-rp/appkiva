<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('badges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('category')->nullable();
            $table->string('tier', 20)->nullable();
            $table->string('requirement')->nullable();
            $table->json('unlock_condition')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('badge_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('badge_id')->index();
            $table->uuid('profile_id')->index();
            $table->timestamp('unlocked_at')->nullable();
            $table->timestamps();
            $table->unique(['badge_id', 'profile_id']);
            $table->foreign('badge_id')->references('id')->on('badges')->onDelete('cascade');
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('streaks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->unique()->index();
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->date('last_active_date')->nullable();
            $table->integer('total_active_days')->default(0);
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('streak_activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->date('activity_date');
            $table->string('activity_type', 50)->nullable();
            $table->timestamps();
            $table->unique(['profile_id', 'activity_date']);
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('streak_activities');
        Schema::dropIfExists('streaks');
        Schema::dropIfExists('badge_progress');
        Schema::dropIfExists('badges');
    }
};

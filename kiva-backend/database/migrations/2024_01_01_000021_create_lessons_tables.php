<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category', 100);
            $table->enum('difficulty', ['beginner', 'explorer', 'saver', 'strategist', 'master'])->default('beginner');
            $table->integer('estimated_minutes')->nullable();
            $table->string('icon')->nullable();
            $table->json('blocks');
            $table->json('quiz')->nullable();
            $table->integer('kiva_points_reward')->default(0);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lesson_id')->index();
            $table->uuid('profile_id')->index();
            $table->decimal('score', 5, 2)->nullable();
            $table->integer('kiva_points_earned')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['lesson_id', 'profile_id']);
            $table->foreign('lesson_id')->references('id')->on('lessons')->onDelete('cascade');
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_progress');
        Schema::dropIfExists('lessons');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('missions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('child_profile_id')->index();
            $table->uuid('parent_profile_id')->nullable()->index();
            $table->uuid('household_id')->nullable()->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['saving', 'budgeting', 'planning', 'custom', 'learning', 'social', 'goal', 'daily', 'weekly']);
            $table->enum('difficulty', ['beginner', 'explorer', 'saver', 'strategist', 'master'])->default('beginner');
            $table->enum('status', ['available', 'in_progress', 'completed'])->default('available');
            $table->enum('source', ['parent', 'engine', 'admin', 'teacher'])->default('parent');
            $table->decimal('reward', 15, 4)->default(0);
            $table->integer('kiva_points_reward')->default(0);
            $table->decimal('target_amount', 15, 4)->nullable();
            $table->integer('week')->nullable();
            $table->boolean('is_auto_generated')->default(false);
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->foreign('child_profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('missions');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mission_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['saving', 'budgeting', 'planning', 'custom', 'learning', 'social', 'goal', 'daily', 'weekly']);
            $table->enum('difficulty', ['beginner', 'explorer', 'saver', 'strategist', 'master'])->default('beginner');
            $table->decimal('reward_coins', 15, 4)->default(0);
            $table->integer('reward_points')->default(0);
            $table->decimal('target_amount', 15, 4)->nullable();
            $table->string('age_group', 20)->nullable();
            $table->json('conditions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->uuid('created_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_templates');
    }
};

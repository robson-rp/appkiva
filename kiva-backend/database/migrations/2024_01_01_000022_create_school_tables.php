<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('classrooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('grade')->nullable();
            $table->string('icon')->nullable();
            $table->string('schedule')->nullable();
            $table->string('subject')->nullable();
            $table->uuid('teacher_profile_id')->index();
            $table->uuid('school_tenant_id')->index();
            $table->timestamps();
            $table->foreign('teacher_profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('classroom_students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('classroom_id')->index();
            $table->uuid('child_profile_id')->index();
            $table->timestamps();
            $table->unique(['classroom_id', 'child_profile_id']);
            $table->foreign('classroom_id')->references('id')->on('classrooms')->onDelete('cascade');
            $table->foreign('child_profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('collective_challenges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('classroom_id')->index();
            $table->uuid('teacher_profile_id')->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('type')->nullable();
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->decimal('reward', 15, 4)->nullable();
            $table->integer('kiva_points_reward')->nullable();
            $table->decimal('target_amount', 15, 4)->nullable();
            $table->decimal('current_amount', 15, 4)->default(0);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
            $table->foreign('classroom_id')->references('id')->on('classrooms')->onDelete('cascade');
            $table->foreign('teacher_profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('weekly_challenges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('type')->nullable();
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->decimal('reward', 15, 4)->nullable();
            $table->integer('kiva_points_reward')->nullable();
            $table->decimal('target_value', 15, 4)->nullable();
            $table->decimal('current_value', 15, 4)->default(0);
            $table->integer('participant_count')->nullable();
            $table->date('week_start')->nullable();
            $table->date('week_end')->nullable();
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_challenges');
        Schema::dropIfExists('collective_challenges');
        Schema::dropIfExists('classroom_students');
        Schema::dropIfExists('classrooms');
    }
};

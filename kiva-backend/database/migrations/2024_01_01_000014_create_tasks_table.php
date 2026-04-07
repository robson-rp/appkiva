<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('child_profile_id')->index();
            $table->uuid('parent_profile_id')->index();
            $table->uuid('household_id')->nullable()->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('reward', 15, 4)->default(0);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'approved'])->default('pending');
            $table->enum('category', ['cleaning', 'studying', 'helping', 'other'])->default('other');
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence')->nullable();
            $table->uuid('recurrence_source_id')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamps();
            $table->foreign('child_profile_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->foreign('parent_profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};

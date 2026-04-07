<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rewards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('parent_profile_id')->index();
            $table->uuid('household_id')->nullable()->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->decimal('price', 15, 4)->default(0);
            $table->enum('category', ['experience', 'privilege', 'physical', 'digital'])->default('privilege');
            $table->boolean('available')->default(true);
            $table->uuid('claimed_by')->nullable();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamps();
            $table->foreign('parent_profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('budget_exception_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('child_profile_id')->index();
            $table->uuid('parent_profile_id')->nullable()->index();
            $table->uuid('reward_id')->nullable();
            $table->decimal('amount', 15, 4);
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->uuid('resolved_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->foreign('child_profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_exception_requests');
        Schema::dropIfExists('rewards');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('children', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->unique()->index();
            $table->uuid('parent_profile_id')->index();
            $table->string('nickname')->nullable();
            $table->string('username')->unique()->nullable();
            $table->string('pin_hash')->nullable(); // bcrypt only, never plain
            $table->date('date_of_birth')->nullable(); // never exposed in API responses
            $table->decimal('daily_spend_limit', 15, 4)->nullable();
            $table->decimal('monthly_budget', 15, 4)->nullable();
            $table->uuid('school_tenant_id')->nullable()->index();
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->foreign('parent_profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};

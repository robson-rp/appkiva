<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('donation_causes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('category')->nullable();
            $table->boolean('is_active')->default(true);
            $table->decimal('total_received', 15, 4)->default(0);
            $table->uuid('tenant_id')->nullable()->index();
            $table->uuid('created_by')->nullable();
            $table->timestamps();
        });

        Schema::create('donations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->uuid('cause_id')->index();
            $table->decimal('amount', 15, 4);
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->foreign('cause_id')->references('id')->on('donation_causes')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
        Schema::dropIfExists('donation_causes');
    }
};

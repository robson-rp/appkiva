<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subscription_tiers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->enum('tier_type', ['free', 'family_premium', 'school_institutional', 'partner_program', 'teacher']);
            $table->decimal('price_monthly', 10, 2)->default(0);
            $table->decimal('price_yearly', 10, 2)->nullable();
            $table->integer('max_children')->nullable();
            $table->integer('max_classrooms')->nullable();
            $table->integer('max_guardians')->nullable();
            $table->integer('max_programs')->nullable();
            $table->decimal('monthly_emission_limit', 15, 4)->nullable();
            $table->decimal('extra_child_price', 10, 2)->nullable();
            $table->string('currency', 3)->default('EUR');
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_tiers');
    }
};

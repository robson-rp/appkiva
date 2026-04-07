<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique()->index();
            $table->string('display_name');
            $table->string('username')->unique()->nullable();
            $table->string('avatar')->nullable();
            $table->uuid('household_id')->nullable()->index();
            $table->uuid('tenant_id')->nullable()->index();
            $table->string('language', 5)->default('pt');
            $table->string('country', 2)->default('PT');
            $table->string('phone', 30)->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('sector', 100)->nullable();
            $table->string('institution_name', 255)->nullable();
            $table->boolean('ranking_visibility')->default(true);
            $table->json('email_preferences')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('household_id')->references('id')->on('households')->onDelete('set null');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};

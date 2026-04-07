<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('household_guardians', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('household_id')->index();
            $table->uuid('profile_id')->index();
            $table->string('role', 50)->default('guardian');
            $table->uuid('invited_by')->nullable();
            $table->enum('permission_level', ['full', 'limited', 'view_only'])->default('view_only');
            $table->timestamps();
            $table->unique(['household_id', 'profile_id']);
            $table->foreign('household_id')->references('id')->on('households')->onDelete('cascade');
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('household_guardians');
    }
};

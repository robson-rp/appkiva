<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('diary_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->text('text');
            $table->string('mood', 50)->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diary_entries');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('allowance_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('child_profile_id')->unique()->index();
            $table->uuid('parent_profile_id')->index();
            $table->decimal('base_amount', 15, 4)->default(0);
            $table->string('frequency', 20)->default('weekly');
            $table->decimal('task_bonus', 15, 4)->nullable();
            $table->decimal('mission_bonus', 15, 4)->nullable();
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamp('next_payment_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('child_profile_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->foreign('parent_profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('allowance_configs');
    }
};

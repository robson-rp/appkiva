<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('event', 50)->unique();
            $table->string('recipient_role', 30)->default('self');
            $table->string('title_template', 255);
            $table->text('message_template');
            $table->string('icon', 10)->default('🔔');
            $table->boolean('is_urgent')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('cooldown_minutes')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};

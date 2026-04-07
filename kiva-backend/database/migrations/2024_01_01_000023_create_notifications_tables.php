<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->string('title');
            $table->text('message');
            $table->string('type', 100);
            $table->boolean('read')->default(false);
            $table->boolean('urgent')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->text('endpoint');
            $table->string('public_key')->nullable();
            $table->string('auth_token')->nullable();
            $table->string('content_encoding')->default('aesgcm');
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('push_device_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->string('token')->unique();
            $table->string('platform', 20)->default('fcm');
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_device_tokens');
        Schema::dropIfExists('push_subscriptions');
        Schema::dropIfExists('notifications');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('supported_currencies', function (Blueprint $table) {
            $table->string('code', 3)->primary(); // ISO 4217 — NOT uuid
            $table->string('name');
            $table->string('symbol', 10);
            $table->integer('decimal_places')->default(2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supported_currencies');
    }
};

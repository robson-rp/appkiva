<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('currency_exchange_rates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('base_currency', 3);
            $table->string('target_currency', 3);
            $table->decimal('rate', 15, 8);
            $table->timestamps();
            $table->foreign('base_currency')->references('code')->on('supported_currencies')->onDelete('cascade');
            $table->foreign('target_currency')->references('code')->on('supported_currencies')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('currency_exchange_rates');
    }
};

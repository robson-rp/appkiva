<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regional_prices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tier_id');
            $table->string('currency_code', 10);
            $table->decimal('price_monthly', 12, 2)->default(0);
            $table->decimal('price_yearly', 12, 2)->default(0);
            $table->decimal('extra_child_price', 12, 2)->default(0);
            $table->timestamps();

            $table->unique(['tier_id', 'currency_code']);
            $table->foreign('tier_id')->references('id')->on('subscription_tiers')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('regional_prices');
    }
};

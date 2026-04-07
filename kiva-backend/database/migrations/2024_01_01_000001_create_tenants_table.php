<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique()->nullable();
            $table->enum('tenant_type', ['family', 'school', 'institutional_partner']);
            $table->string('currency', 3)->default('EUR');
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->uuid('subscription_tier_id')->nullable();
            $table->integer('extra_children_purchased')->default(0);
            $table->boolean('real_money_enabled')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('partner_programs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('partner_tenant_id')->index();
            $table->string('program_name');
            $table->string('program_type')->nullable();
            $table->enum('status', ['active', 'paused', 'ended'])->default('active');
            $table->decimal('investment_amount', 15, 4)->nullable();
            $table->decimal('budget_spent', 15, 4)->default(0);
            $table->integer('children_count')->default(0);
            $table->uuid('target_household_id')->nullable();
            $table->uuid('target_tenant_id')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamps();
        });

        Schema::create('program_invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('program_id')->index();
            $table->uuid('partner_tenant_id')->index();
            $table->string('code')->unique();
            $table->enum('status', ['pending', 'accepted', 'expired', 'revoked'])->default('pending');
            $table->string('target_type')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->uuid('accepted_by')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
            $table->foreign('program_id')->references('id')->on('partner_programs')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_invitations');
        Schema::dropIfExists('partner_programs');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('risk_flags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('profile_id')->index();
            $table->uuid('tenant_id')->nullable()->index();
            $table->enum('flag_type', ['excessive_rewards', 'unusual_transactions', 'rate_limit_hit', 'task_exploitation']);
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->uuid('resolved_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
            $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });

        Schema::create('audit_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('action', [
                'insert', 'update', 'delete', 'login', 'logout',
                'consent_granted', 'consent_revoked', 'role_changed',
                'wallet_transfer', 'admin_action',
            ]);
            $table->string('resource_type')->nullable();
            $table->uuid('resource_id')->nullable();
            $table->uuid('profile_id')->nullable()->index();
            $table->uuid('user_id')->nullable()->index();
            $table->uuid('tenant_id')->nullable()->index();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('consent_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('adult_profile_id')->index();
            $table->uuid('child_profile_id')->index();
            $table->string('consent_type', 100);
            $table->timestamp('granted_at');
            $table->timestamp('revoked_at')->nullable();
            $table->text('revocation_reason')->nullable();
            $table->json('ip_metadata')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->foreign('adult_profile_id')->references('id')->on('profiles')->onDelete('cascade');
            $table->foreign('child_profile_id')->references('id')->on('profiles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consent_records');
        Schema::dropIfExists('audit_log');
        Schema::dropIfExists('risk_flags');
    }
};

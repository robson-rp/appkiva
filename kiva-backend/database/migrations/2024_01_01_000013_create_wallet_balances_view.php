<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement('DROP VIEW IF EXISTS wallet_balances');
        DB::statement("
            CREATE VIEW wallet_balances AS
            SELECT
                w.id AS wallet_id,
                w.profile_id,
                w.wallet_type,
                w.currency,
                COALESCE(
                    SUM(CASE WHEN le.credit_wallet_id = w.id THEN le.amount ELSE 0 END) -
                    SUM(CASE WHEN le.debit_wallet_id = w.id THEN le.amount ELSE 0 END),
                    0
                ) AS balance
            FROM wallets w
            LEFT JOIN ledger_entries le ON le.credit_wallet_id = w.id OR le.debit_wallet_id = w.id
            GROUP BY w.id, w.profile_id, w.wallet_type, w.currency
        ");
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS wallet_balances');
    }
};

<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\SubscriptionTier;
use App\Models\SupportedCurrency;
use App\Models\User;
use App\Models\Profile;
use App\Models\Household;
use App\Models\HouseholdGuardian;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedRoles();
        $this->seedCurrencies();
        $this->seedSubscriptionTiers();
        $this->seedBadges();
        $this->seedDemoData();
    }

    protected function seedRoles(): void
    {
        foreach (['parent', 'child', 'teen', 'teacher', 'admin', 'partner'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'api']);
        }
    }

    protected function seedCurrencies(): void
    {
        $currencies = [
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'decimal_places' => 2],
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'decimal_places' => 2],
            ['code' => 'BRL', 'name' => 'Brazilian Real', 'symbol' => 'R$', 'decimal_places' => 2],
            ['code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£', 'decimal_places' => 2],
        ];

        foreach ($currencies as $currency) {
            SupportedCurrency::firstOrCreate(['code' => $currency['code']], $currency);
        }
    }

    protected function seedSubscriptionTiers(): void
    {
        $tiers = [
            ['name' => 'Free', 'tier_type' => 'free', 'price_monthly' => 0, 'max_children' => 1],
            ['name' => 'Family Premium', 'tier_type' => 'family_premium', 'price_monthly' => 9.99, 'max_children' => 5],
            ['name' => 'School Institutional', 'tier_type' => 'school_institutional', 'price_monthly' => 49.99, 'max_children' => null, 'max_classrooms' => 10],
            ['name' => 'Partner Program', 'tier_type' => 'partner_program', 'price_monthly' => 199.99, 'max_programs' => 10],
        ];

        foreach ($tiers as $tier) {
            SubscriptionTier::firstOrCreate(['tier_type' => $tier['tier_type']], $tier);
        }
    }

    protected function seedBadges(): void
    {
        $badges = [
            ['name' => 'First Task', 'category' => 'tasks', 'tier' => 'bronze', 'unlock_condition' => ['type' => 'task_count', 'value' => 1]],
            ['name' => 'Task Champion', 'category' => 'tasks', 'tier' => 'gold', 'unlock_condition' => ['type' => 'task_count', 'value' => 50]],
            ['name' => 'Streak Starter', 'category' => 'streaks', 'tier' => 'bronze', 'unlock_condition' => ['type' => 'streak_days', 'value' => 3]],
            ['name' => 'Streak Master', 'category' => 'streaks', 'tier' => 'gold', 'unlock_condition' => ['type' => 'streak_days', 'value' => 30]],
            ['name' => 'Mission Possible', 'category' => 'missions', 'tier' => 'silver', 'unlock_condition' => ['type' => 'missions_completed', 'value' => 5]],
        ];

        foreach ($badges as $i => $badge) {
            Badge::firstOrCreate(['name' => $badge['name']], array_merge($badge, ['sort_order' => $i, 'is_active' => true]));
        }
    }

    protected function seedDemoData(): void
    {
        if (app()->isProduction()) {
            return;
        }

        $adminUser = User::firstOrCreate(['email' => 'admin@kivara.local'], [
            'password' => bcrypt('AdminPass123!'),
        ]);
        $adminUser->assignRole('admin');
        $adminProfile = Profile::firstOrCreate(['user_id' => $adminUser->id], [
            'display_name' => 'KIVARA Admin',
            'language'     => 'pt',
            'country'      => 'PT',
        ]);

        $parentUser = User::firstOrCreate(['email' => 'parent@kivara.local'], [
            'password' => bcrypt('ParentPass123!'),
        ]);
        $parentUser->assignRole('parent');
        $household = Household::firstOrCreate(['name' => 'Demo Family']);
        $parentProfile = Profile::firstOrCreate(['user_id' => $parentUser->id], [
            'display_name' => 'Demo Parent',
            'household_id' => $household->id,
            'language'     => 'pt',
            'country'      => 'PT',
        ]);

        HouseholdGuardian::firstOrCreate(
            ['household_id' => $household->id, 'profile_id' => $parentProfile->id],
            ['role' => 'owner', 'permission_level' => 'full']
        );

        Wallet::firstOrCreate(['profile_id' => $parentProfile->id, 'wallet_type' => 'virtual'], ['currency' => 'EUR']);
        Wallet::firstOrCreate(['profile_id' => $parentProfile->id, 'wallet_type' => 'real'], ['currency' => 'EUR']);
    }
}

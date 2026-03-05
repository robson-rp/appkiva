

# KIVARA — Financial Education Platform for Kids & Families

## Overview
A gamified financial education web app with two experiences: a **Parent Dashboard** (management & oversight) and a **Child Experience** (gamified learning). Built with mock data and basic authentication to distinguish parent/child roles.

## Brand & Design System
- **Colors**: Deep Blue (`#2c5b8f`), Green (`#45a188`), Gold (`#fbb845`), with soft pastels for the child interface
- **Style**: Rounded corners, card-based layouts, friendly typography, fintech-inspired dashboards
- **Child UI**: Playful, colorful, large touch-friendly elements with animations
- **Parent UI**: Clean, professional dashboard with data visualizations

## Authentication & Roles
- Login/signup page with role selection (Parent or Child)
- Parents create child accounts linked to their family
- Children log in with simplified credentials (username + PIN)
- Basic auth using Supabase (email/password for parents, managed child accounts)

## Module 1 — Parent Dashboard
- **Overview**: Family financial summary — total coins distributed, savings progress, tasks completed
- **Child Management**: Add/edit/remove child profiles with avatar selection
- **Task Management**: Create tasks with coin rewards, approve completed tasks
- **Allowance Settings**: Set weekly virtual allowance per child
- **Reports**: Charts showing spending vs saving habits, task completion rates, mission progress

## Module 2 — Child Dashboard
- Welcome screen with Kivo (interactive mascot) giving daily tips via speech bubbles
- Quick stats: wallet balance, pending tasks, active missions, savings progress
- Level indicator with progress bar (Apprentice → Saver → Planner → Investor → Master)
- Notification center for pending approvals, new missions, achievements

## Module 3 — Wallet (KivaraCoins)
- Balance display with animated coin counter
- Transaction history (earned, spent, saved)
- Quick actions: transfer to vault, spend in store
- Visual breakdown: earned vs spent vs saved (pie chart)

## Module 4 — Tasks & Rewards
- List of parent-assigned tasks with coin rewards
- Task states: pending, in progress, completed, approved
- Child marks task as done → parent approves → coins credited
- Task categories with icons (cleaning, studying, helping)

## Module 5 — Financial Missions
- Weekly themed missions (e.g., "Save 50 coins", "Budget 100 coins wisely")
- Interactive decision scenarios with Kivo explaining outcomes
- Mission completion awards KivaPoints and coins
- Mission history and streaks

## Module 6 — Savings Vaults
- Create named savings goals with target amounts
- Visual progress bars with percentage and estimated time
- Optional simulated interest (coins grow over time)
- Celebrate goal completion with confetti animation

## Module 7 — Virtual Store
- Browse items: avatar skins, accessories, badges, digital items
- Purchase with KivaraCoins
- Inventory of purchased items
- Items displayed as colorful cards with prices

## Kivo — Interactive Mascot
- Smart African squirrel character appearing as speech bubble overlays
- Contextual tips on each page (e.g., "Great job saving! Keep it up!")
- Guides children through first-time experiences
- Celebrates achievements with animated reactions

## Gamification System
- **Levels**: Apprentice (0) → Saver (100pts) → Planner (300pts) → Investor (600pts) → Master (1000pts)
- **Achievements**: Badges for milestones (first save, 10 tasks completed, etc.)
- **Leaderboard**: Family ranking among siblings
- **Weekly Challenges**: Time-limited goals for bonus rewards

## Notifications
- Toast notifications for: task approvals, mission availability, milestones reached, achievements unlocked
- Notification bell with unread count in the header

## Navigation Structure
- **Parent**: Sidebar with Dashboard, Children, Tasks, Allowance, Reports, Settings
- **Child**: Bottom navigation bar (Dashboard, Wallet, Missions, Vaults, Store) + header with profile/notifications

## Pages Summary
| Route | Role | Description |
|-------|------|-------------|
| `/login` | All | Login with role selection |
| `/signup` | Parent | Parent registration |
| `/parent` | Parent | Parent dashboard overview |
| `/parent/children` | Parent | Manage child accounts |
| `/parent/tasks` | Parent | Create & approve tasks |
| `/parent/allowance` | Parent | Weekly allowance settings |
| `/parent/reports` | Parent | Activity reports & charts |
| `/child` | Child | Child dashboard with Kivo |
| `/child/wallet` | Child | Wallet & transactions |
| `/child/missions` | Child | Weekly missions |
| `/child/vaults` | Child | Savings goals |
| `/child/achievements` | Child | Badges & levels |
| `/child/store` | Child | Virtual store |

## Data Approach
- Mock data with React state management for the initial build
- Structured to easily replace with Supabase queries later
- Data models: Users, Children, Tasks, Transactions, Vaults, Missions, Achievements, StoreItems




# Game Design System -- Enhance Existing KIVARA Gamification

## Current State (Already Built)

The platform already has substantial gamification:
- **5-level progression** (Apprentice → Master) with evolving emoji avatars and LevelUpCeremony
- **20 collectible badges** across 4 categories/tiers with BadgeUnlockCeremony (confetti, sound, haptics)
- **KivaPoints** (equivalent to FXP/XP) earned from tasks, missions, lessons
- **StreakWidget** with daily activity tracking and milestone rewards
- **Weekly Challenges** with class leaderboard and podium UI
- **AvatarGlow** with orbital particles per level
- **CoinDisplay** and celebration sound/haptic effects
- **Family Rankings** (Saver, Planner, Donor categories)
- **Missions, Lessons, Store** pages

## What to Build (Enhancing Existing System)

### 1. Persistent XP Progress Header

Add a compact, always-visible XP/level indicator to the child and teen layouts (below the nav bar). Shows current level avatar, XP bar to next level, and animates on point gain.

- New component: `src/components/XPProgressBar.tsx`
- Update `ChildLayout.tsx` and `TeenLayout.tsx` to include it

### 2. Financial Learning Progress Map

A visual, game-style progression map showing lesson categories as "worlds" (Understanding Money → Saving → Budgeting → Investing → Entrepreneurship). Each world has nodes (lessons) that unlock sequentially. Completed nodes glow, locked ones are greyed.

- New component: `src/components/LearningProgressMap.tsx`
- Add as a new tab or section in `LearnPage.tsx`
- Uses existing `lessons` and `lesson_progress` data

### 3. Coin-Flying Reward Animation

A reusable animation overlay that shows coins flying from a source point into the wallet icon. Triggered on task approval, mission completion, lesson completion.

- New component: `src/components/CoinFlyAnimation.tsx`
- New context: `src/contexts/RewardAnimationContext.tsx` (provides `triggerCoinFly()` globally)
- Integrate into existing mutation hooks' `onSuccess` callbacks

### 4. Daily/Weekly Mission Cards

Enhance the ChildMissions page to distinguish Daily Missions (quick, 1-day expiry) from Weekly Quests (multi-step, 7-day). Add countdown timers and "daily refresh" indicator.

- Update `src/pages/child/ChildMissions.tsx` to add Daily/Weekly sub-sections within the existing missions tab
- New component: `src/components/DailyMissionCard.tsx` with countdown timer
- Uses existing `mockMissions` data, filtered by a new `duration` field added to the type

### 5. Enhanced Reward Feedback System

Unify all reward moments with consistent micro-animations:
- Task approved → coin fly + XP pulse + sound
- Lesson completed → star burst + XP gain toast
- Badge unlocked → existing ceremony (already great)
- Level up → existing ceremony (already great)
- Savings milestone → progress ring fill animation

- Update `src/lib/celebration-effects.ts` with `playCoinSound()` and `playXPGain()`
- Add `src/components/XPGainToast.tsx` -- a floating "+15 XP" that fades upward

### 6. League System (Weekly Ranking Tiers)

Build on existing weekly challenges leaderboard. Add league tiers (Bronze, Silver, Gold, Diamond) based on weekly XP. Users promote/demote at week end.

- New component: `src/components/LeagueBadge.tsx` showing current league tier
- Update `WeeklyChallenges.tsx` to show league tier alongside the class ranking
- Visual: animated medal/shield that changes color per tier

### 7. Avatar Profile Card Enhancement

Enhance the existing avatar display to show level, league tier, badge count, and streak in a compact "player card" format. Visible on dashboard hero and profile pages.

- New component: `src/components/PlayerCard.tsx`
- Replaces the simple AvatarGlow + LevelBadge combo in dashboard hero sections

---

## File Changes Summary

| Area | File | Action |
|------|------|--------|
| XP Bar | `src/components/XPProgressBar.tsx` | New |
| XP Bar | `src/components/layouts/ChildLayout.tsx` | Update (add bar) |
| XP Bar | `src/components/layouts/TeenLayout.tsx` | Update (add bar) |
| Progress Map | `src/components/LearningProgressMap.tsx` | New |
| Progress Map | `src/pages/shared/LearnPage.tsx` | Update (add map tab) |
| Coin Animation | `src/components/CoinFlyAnimation.tsx` | New |
| Coin Animation | `src/contexts/RewardAnimationContext.tsx` | New |
| Coin Animation | `src/App.tsx` | Update (wrap provider) |
| Daily Missions | `src/components/DailyMissionCard.tsx` | New |
| Daily Missions | `src/pages/child/ChildMissions.tsx` | Update |
| Reward Feedback | `src/components/XPGainToast.tsx` | New |
| Reward Feedback | `src/lib/celebration-effects.ts` | Update (add sounds) |
| League | `src/components/LeagueBadge.tsx` | New |
| League | `src/components/WeeklyChallenges.tsx` | Update |
| Player Card | `src/components/PlayerCard.tsx` | New |
| Player Card | `src/pages/child/ChildDashboard.tsx` | Update (hero section) |
| Types | `src/types/kivara.ts` | Update (add League types) |

No database changes required -- all enhancements use existing data (KivaPoints, lessons, streaks, badges).


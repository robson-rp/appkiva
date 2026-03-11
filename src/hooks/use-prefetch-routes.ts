import { useEffect } from 'react';

const ROUTE_MAP: Record<string, (() => Promise<unknown>)[]> = {
  child: [
    () => import('@/pages/child/ChildWallet'),
    () => import('@/pages/child/ChildTasks'),
    () => import('@/pages/child/ChildMissions'),
    () => import('@/pages/shared/LearnPage'),
    () => import('@/pages/child/ChildVaults'),
    () => import('@/pages/child/ChildStore'),
    () => import('@/pages/child/ChildAchievements'),
  ],
  teen: [
    () => import('@/pages/teen/TeenWallet'),
    () => import('@/pages/teen/TeenTasks'),
    () => import('@/pages/teen/TeenMissions'),
    () => import('@/pages/teen/TeenVaults'),
    () => import('@/pages/teen/TeenAnalytics'),
    () => import('@/pages/shared/LearnPage'),
  ],
  parent: [
    () => import('@/pages/parent/ParentChildren'),
    () => import('@/pages/parent/ParentTasks'),
    () => import('@/pages/parent/ParentReports'),
    () => import('@/pages/parent/ParentAllowance'),
    () => import('@/pages/parent/ParentRewards'),
    () => import('@/pages/parent/ParentMissions'),
    () => import('@/pages/parent/ParentVaults'),
  ],
  teacher: [
    () => import('@/pages/teacher/TeacherClasses'),
    () => import('@/pages/teacher/TeacherChallenges'),
  ],
  partner: [
    () => import('@/pages/partner/PartnerPrograms'),
    () => import('@/pages/partner/PartnerChallenges'),
    () => import('@/pages/partner/PartnerReports'),
  ],
  admin: [
    () => import('@/pages/admin/AdminUsers'),
    () => import('@/pages/admin/AdminTenants'),
    () => import('@/pages/admin/AdminSubscriptions'),
    () => import('@/pages/admin/AdminFinance'),
    () => import('@/pages/admin/AdminSchools'),
    () => import('@/pages/admin/AdminBanners'),
    () => import('@/pages/admin/AdminMissions'),
    () => import('@/pages/admin/AdminLessons'),
    () => import('@/pages/admin/AdminCurrencies'),
    () => import('@/pages/admin/AdminCompliance'),
    () => import('@/pages/admin/AdminAuthSecurity'),
    () => import('@/pages/admin/AdminRisk'),
    () => import('@/pages/admin/AdminAudit'),
    () => import('@/pages/admin/AdminNotifications'),
    () => import('@/pages/admin/AdminOnboarding'),
  ],
};

// Path-to-loader map for on-hover prefetch
const PATH_LOADERS: Record<string, () => Promise<unknown>> = {
  // Child
  '/child': () => import('@/pages/child/ChildDashboard'),
  '/child/wallet': () => import('@/pages/child/ChildWallet'),
  '/child/tasks': () => import('@/pages/child/ChildTasks'),
  '/child/missions': () => import('@/pages/child/ChildMissions'),
  '/child/vaults': () => import('@/pages/child/ChildVaults'),
  '/child/store': () => import('@/pages/child/ChildStore'),
  '/child/achievements': () => import('@/pages/child/ChildAchievements'),
  '/child/dreams': () => import('@/pages/child/ChildDreams'),
  '/child/diary': () => import('@/pages/child/ChildDiary'),
  '/child/ranking': () => import('@/pages/child/ChildRanking'),
  '/child/profile': () => import('@/pages/child/ChildProfile'),
  // Teen
  '/teen': () => import('@/pages/teen/TeenDashboard'),
  '/teen/wallet': () => import('@/pages/teen/TeenWallet'),
  '/teen/tasks': () => import('@/pages/teen/TeenTasks'),
  '/teen/missions': () => import('@/pages/teen/TeenMissions'),
  '/teen/vaults': () => import('@/pages/teen/TeenVaults'),
  '/teen/analytics': () => import('@/pages/teen/TeenAnalytics'),
  '/teen/profile': () => import('@/pages/teen/TeenProfile'),
  // Parent
  '/parent': () => import('@/pages/parent/ParentDashboard'),
  '/parent/children': () => import('@/pages/parent/ParentChildren'),
  '/parent/tasks': () => import('@/pages/parent/ParentTasks'),
  '/parent/missions': () => import('@/pages/parent/ParentMissions'),
  '/parent/reports': () => import('@/pages/parent/ParentReports'),
  '/parent/allowance': () => import('@/pages/parent/ParentAllowance'),
  '/parent/rewards': () => import('@/pages/parent/ParentRewards'),
  '/parent/vaults': () => import('@/pages/parent/ParentVaults'),
  '/parent/subscription': () => import('@/pages/parent/ParentSubscription'),
  '/parent/profile': () => import('@/pages/parent/ParentProfile'),
  // Teacher
  '/teacher': () => import('@/pages/teacher/TeacherDashboard'),
  '/teacher/classes': () => import('@/pages/teacher/TeacherClasses'),
  '/teacher/challenges': () => import('@/pages/teacher/TeacherChallenges'),
  '/teacher/profile': () => import('@/pages/teacher/TeacherProfile'),
  // Partner
  '/partner': () => import('@/pages/partner/PartnerDashboard'),
  '/partner/programs': () => import('@/pages/partner/PartnerPrograms'),
  '/partner/challenges': () => import('@/pages/partner/PartnerChallenges'),
  '/partner/reports': () => import('@/pages/partner/PartnerReports'),
  '/partner/profile': () => import('@/pages/partner/PartnerProfile'),
  // Admin
  '/admin': () => import('@/pages/admin/AdminDashboard'),
  '/admin/users': () => import('@/pages/admin/AdminUsers'),
  '/admin/tenants': () => import('@/pages/admin/AdminTenants'),
  '/admin/subscriptions': () => import('@/pages/admin/AdminSubscriptions'),
  '/admin/finance': () => import('@/pages/admin/AdminFinance'),
  '/admin/schools': () => import('@/pages/admin/AdminSchools'),
  '/admin/banners': () => import('@/pages/admin/AdminBanners'),
  '/admin/missions': () => import('@/pages/admin/AdminMissions'),
  '/admin/lessons': () => import('@/pages/admin/AdminLessons'),
  '/admin/currencies': () => import('@/pages/admin/AdminCurrencies'),
  '/admin/compliance': () => import('@/pages/admin/AdminCompliance'),
  '/admin/auth-security': () => import('@/pages/admin/AdminAuthSecurity'),
  '/admin/risk': () => import('@/pages/admin/AdminRisk'),
  '/admin/audit': () => import('@/pages/admin/AdminAudit'),
  '/admin/notifications': () => import('@/pages/admin/AdminNotifications'),
  '/admin/onboarding': () => import('@/pages/admin/AdminOnboarding'),
  // Parent extras
  '/parent/consent': () => import('@/pages/parent/ParentConsent'),
  '/parent/support': () => import('@/pages/parent/ParentSupport'),
  // Shared
  '/learn': () => import('@/pages/shared/LearnPage'),
  '/badges': () => import('@/pages/shared/BadgesPage'),
  '/streaks': () => import('@/pages/shared/StreaksPage'),
};

const prefetched = new Set<string>();

/** Prefetch a page chunk by its route path. Safe to call multiple times. */
export function prefetchByPath(path: string) {
  // Normalize: strip trailing slash, take base path
  const normalized = path.replace(/\/$/, '') || '/';
  if (prefetched.has(normalized)) return;
  const loader = PATH_LOADERS[normalized];
  if (loader) {
    prefetched.add(normalized);
    loader().catch(() => {});
  }
}

export function usePrefetchRoutes(role: string) {
  useEffect(() => {
    const loaders = ROUTE_MAP[role];
    if (!loaders) return;

    const schedule = typeof requestIdleCallback === 'function'
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 200);

    const id = schedule(() => {
      loaders.forEach((load) => load().catch(() => {}));
    });

    return () => {
      if (typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(id as number);
      }
    };
  }, [role]);
}

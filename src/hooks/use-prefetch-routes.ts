import { useEffect } from 'react';

const ROUTE_MAP: Record<string, (() => Promise<unknown>)[]> = {
  child: [
    () => import('@/pages/child/ChildWallet'),
    () => import('@/pages/child/ChildTasks'),
    () => import('@/pages/child/ChildMissions'),
    () => import('@/pages/shared/LearnPage'),
  ],
  teen: [
    () => import('@/pages/teen/TeenWallet'),
    () => import('@/pages/teen/TeenTasks'),
    () => import('@/pages/teen/TeenMissions'),
  ],
  parent: [
    () => import('@/pages/parent/ParentChildren'),
    () => import('@/pages/parent/ParentTasks'),
    () => import('@/pages/parent/ParentReports'),
  ],
};

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

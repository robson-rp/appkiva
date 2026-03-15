import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, LogOut, UserCircle, GraduationCap, School, MoreHorizontal } from 'lucide-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
import kivaraLogo from '@/assets/logo-kivara.svg';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { OnboardingWalkthrough } from '@/components/OnboardingWalkthrough';
import { useCollectiveChallenges } from '@/hooks/use-collective-challenges';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useT } from '@/contexts/LanguageContext';

function useTeacherNav() {
  const t = useT();
  const { data: challenges = [] } = useCollectiveChallenges();
  const urgentChallenges = challenges.filter(
    c => c.status === 'active' && c.target_amount > 0 && (c.current_amount / c.target_amount) >= 0.5
  );
  const urgentChallengesCount = urgentChallenges.length;
  const hasCriticalChallenges = urgentChallenges.some(c => (c.current_amount / c.target_amount) >= 0.8);

  const navItems = [
    { title: t('nav.teacher.panel'), url: '/teacher', icon: LayoutDashboard },
    { title: t('nav.teacher.classes'), url: '/teacher/classes', icon: Users },
    { title: t('nav.teacher.challenges'), url: '/teacher/challenges', icon: Trophy, badge: urgentChallengesCount },
    { title: t('nav.teacher.school'), url: '/teacher/school', icon: School },
    { title: t('nav.teacher.profile'), url: '/teacher/profile', icon: UserCircle },
  ];

  const mobileFixedItems = [
    { title: t('nav.teacher.panel'), url: '/teacher', icon: LayoutDashboard },
    { title: t('nav.teacher.classes'), url: '/teacher/classes', icon: Users },
    { title: t('nav.teacher.challenges'), url: '/teacher/challenges', icon: Trophy, badge: urgentChallengesCount },
  ];

  const mobileMoreItems = [
    { title: t('nav.teacher.school'), url: '/teacher/school', icon: School },
    { title: t('nav.teacher.profile'), url: '/teacher/profile', icon: UserCircle },
  ];

  return { navItems, mobileFixedItems, mobileMoreItems, urgentChallenges, hasCriticalChallenges };
}

function TeacherSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const { navItems, urgentChallenges, hasCriticalChallenges } = useTeacherNav();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-3">
          {!collapsed && (
            <div>
              <img src={kivaraLogo} alt="KIVARA" className="h-9 brightness-0 invert" />
              <p className="text-small text-sidebar-foreground/50 font-body mt-0.5">{t('nav.teacher.slogan')}</p>
            </div>
          )}
          {collapsed && <GraduationCap className="h-5 w-5 text-sidebar-primary" />}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-caption uppercase tracking-widest">{t('nav.parent.menu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/teacher'}
                      className="hover:bg-sidebar-accent/50 rounded-xl transition-all duration-200 min-h-[44px]"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm"
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                      {!collapsed && item.badge ? (
                        <HoverCard openDelay={150} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <button type="button" onClick={(e) => e.preventDefault()} className="ml-auto cursor-help">
                              <Badge className={`h-5 min-w-5 px-1.5 text-caption bg-destructive text-destructive-foreground border-0 ${hasCriticalChallenges ? 'animate-pulse' : ''}`}>{item.badge}</Badge>
                            </button>
                          </HoverCardTrigger>
                          <HoverCardContent side="right" className="w-56 p-3 space-y-1.5">
                            <p className="font-display font-bold text-small">{t('nav.teacher.challenges_ending')}</p>
                            {urgentChallenges.map(ch => (
                              <button
                                key={ch.id}
                                type="button"
                                onClick={() => navigate('/teacher/challenges')}
                                className="flex items-center justify-between gap-2 text-small w-full rounded-lg px-2 py-1.5 hover:bg-accent/50 transition-colors text-left"
                              >
                                <span>{ch.icon} {ch.title}</span>
                                <span className="font-bold text-primary">{Math.round((ch.current_amount / ch.target_amount) * 100)}%</span>
                              </button>
                            ))}
                          </HoverCardContent>
                        </HoverCard>
                      ) : null}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          {!collapsed && user && (
            <div className="mb-3 flex items-center gap-3 p-2.5 rounded-xl bg-sidebar-accent/30">
              <div className="w-10 h-10 rounded-xl bg-sidebar-accent flex items-center justify-center text-lg">
                {user.avatar}
              </div>
              <div>
                <p className="text-sm font-display font-bold text-sidebar-foreground">{user.name}</p>
                <p className="text-caption text-sidebar-foreground/50 uppercase tracking-wider">{t('nav.teacher.role')}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'default'}
            className="w-full text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-destructive/10 rounded-xl transition-all duration-200"
            onClick={logout}
            aria-label={t('common.logout')}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-2">{t('common.logout')}</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function TeacherLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const t = useT();
  const { mobileFixedItems, mobileMoreItems, hasCriticalChallenges } = useTeacherNav();

  const isMoreRouteActive = mobileMoreItems.some((item) =>
    location.pathname === item.url || location.pathname.startsWith(item.url + '/')
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <TeacherSidebar />}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="relative z-50">
            <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-b border-border/50" />
            <div className="relative h-16 flex items-center justify-between px-4 gap-4">
              <div className="flex items-center gap-4">
                {!isMobile && <SidebarTrigger />}
                <div className="flex items-center gap-2">
                  <img src={kivaraLogo} alt="KIVARA" className="h-8 opacity-70" />
                  <span className="text-caption font-display font-semibold text-muted-foreground bg-secondary/10 text-secondary px-2.5 py-1 rounded-lg">{t('nav.teacher.badge')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <NotificationDropdown />
                {isMobile && (
                  <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground rounded-2xl hover:bg-destructive/10 hover:text-destructive" aria-label={t('common.logout')}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </header>
          <AnimatePresence mode="wait">
            <motion.main
              id="main-content"
              role="main"
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto ${isMobile ? 'pb-28' : ''}`}
            >
              {children}
            </motion.main>
          </AnimatePresence>

          {isMobile && (
            <nav className="fixed bottom-0 left-0 right-0 z-40" role="navigation" aria-label={t('common.more_options')}>
              <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border/50" />
              <div className="relative px-2 py-2.5 flex justify-around items-center max-w-lg mx-auto">
                {mobileFixedItems.map((item) => {
                  const isActive = item.url === '/teacher'
                    ? location.pathname === '/teacher'
                    : location.pathname.startsWith(item.url);

                  return (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      end={item.url === '/teacher'}
                      className="relative flex flex-col items-center min-w-[48px] min-h-[48px] justify-center rounded-2xl transition-all duration-200 text-muted-foreground"
                      activeClassName="text-primary"
                    >
                      <div className="relative p-2 rounded-xl">
                        {item.badge ? (
                          <span className={`absolute -top-0.5 -right-0.5 z-20 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-caption font-bold px-1 ${hasCriticalChallenges ? 'animate-pulse' : ''}`}>{item.badge}</span>
                        ) : null}
                        {isActive && (
                          <motion.div
                            layoutId="teacher-nav-bg"
                            className="absolute inset-0 rounded-xl bg-primary/10"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        <motion.div
                          animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <item.icon className={`h-6 w-6 relative z-10 transition-colors duration-200 ${isActive ? 'text-primary' : ''}`} />
                        </motion.div>
                      </div>
                      <motion.span
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`text-caption mt-0.5 font-semibold ${isActive ? 'text-primary' : ''}`}
                      >
                        {item.title}
                      </motion.span>
                    </NavLink>
                  );
                })}

                <button
                  onClick={() => setMoreOpen(true)}
                  className={`relative flex flex-col items-center min-w-[48px] min-h-[48px] justify-center rounded-2xl transition-all duration-200 ${isMoreRouteActive ? 'text-primary' : 'text-muted-foreground'}`}
                  aria-label={t('common.more_options')}
                >
                  <div className={`relative p-2 rounded-xl transition-all duration-300 ${isMoreRouteActive ? 'bg-primary/10' : ''}`}>
                    <MoreHorizontal className="h-6 w-6 relative z-10" />
                  </div>
                  <span className="text-caption mt-0.5 font-semibold">{t('common.more')}</span>
                  {isMoreRouteActive && (
                    <div className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              </div>
            </nav>
          )}

          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8">
              <SheetHeader className="pb-2">
                <SheetTitle className="text-center text-lg font-display">{t('common.more_features')}</SheetTitle>
              </SheetHeader>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-3 gap-3 pt-2"
              >
                {mobileMoreItems.map((item) => {
                  const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/');

                  return (
                    <button
                      key={item.url}
                      onClick={() => {
                        setMoreOpen(false);
                        navigate(item.url);
                      }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 active:scale-95 ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/60'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-primary/15' : 'bg-muted/80'}`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-semibold">{item.title}</span>
                    </button>
                  );
                })}
              </motion.div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <OnboardingWalkthrough />
    </SidebarProvider>
  );
}

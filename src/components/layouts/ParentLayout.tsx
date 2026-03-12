import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ListTodo, Wallet, BarChart3, LogOut, UserCircle, Gift, PiggyBank, Crown, Shield, Lock, MoreHorizontal, Headphones, Target, Sparkles, Brain, Activity } from 'lucide-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
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
import { useAllFeatures, FEATURES, FeatureKey } from '@/hooks/use-feature-gate';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useT } from '@/contexts/LanguageContext';

function useNavItems() {
  const t = useT();
  const navItems: { title: string; url: string; icon: any; requiredFeature?: FeatureKey }[] = [
    { title: t('nav.parent.panel'), url: '/parent', icon: LayoutDashboard },
    { title: t('nav.parent.children'), url: '/parent/children', icon: Users },
    { title: t('nav.parent.tasks'), url: '/parent/tasks', icon: ListTodo },
    { title: t('nav.parent.missions') || 'Missões', url: '/parent/missions', icon: Target },
    { title: t('nav.parent.allowance'), url: '/parent/allowance', icon: Wallet },
    { title: t('nav.parent.insights') || 'Insights', url: '/parent/insights', icon: Brain },
    { title: t('nav.parent.activity') || 'Actividades', url: '/parent/activity', icon: Activity },
    { title: t('nav.parent.vaults'), url: '/parent/vaults', icon: PiggyBank, requiredFeature: FEATURES.SAVINGS_VAULTS },
    { title: t('nav.parent.dreams'), url: '/parent/dreams', icon: Sparkles, requiredFeature: FEATURES.DREAM_VAULTS },
    { title: t('nav.parent.rewards'), url: '/parent/rewards', icon: Gift, requiredFeature: FEATURES.CUSTOM_REWARDS },
    { title: t('nav.parent.reports'), url: '/parent/reports', icon: BarChart3, requiredFeature: FEATURES.ADVANCED_ANALYTICS },
    { title: t('nav.parent.profile'), url: '/parent/profile', icon: UserCircle },
    { title: t('nav.parent.consent'), url: '/parent/consent', icon: Shield },
    { title: t('nav.parent.subscription'), url: '/parent/subscription', icon: Crown },
    { title: t('nav.parent.support'), url: '/parent/support', icon: Headphones },
  ];

  const mobileFixedItems = [
    { title: t('nav.parent.panel'), url: '/parent', icon: LayoutDashboard },
    { title: t('nav.parent.children'), url: '/parent/children', icon: Users },
    { title: t('nav.parent.tasks'), url: '/parent/tasks', icon: ListTodo },
    { title: t('nav.parent.allowance'), url: '/parent/allowance', icon: Wallet },
  ];

  const mobileMoreItems: { title: string; url: string; icon: any; requiredFeature?: FeatureKey }[] = [
    { title: t('nav.parent.insights') || 'Insights', url: '/parent/insights', icon: Brain },
    { title: t('nav.parent.activity') || 'Actividades', url: '/parent/activity', icon: Activity },
    { title: t('nav.parent.vaults'), url: '/parent/vaults', icon: PiggyBank, requiredFeature: FEATURES.SAVINGS_VAULTS },
    { title: t('nav.parent.dreams'), url: '/parent/dreams', icon: Sparkles, requiredFeature: FEATURES.DREAM_VAULTS },
    { title: t('nav.parent.rewards'), url: '/parent/rewards', icon: Gift, requiredFeature: FEATURES.CUSTOM_REWARDS },
    { title: t('nav.parent.reports'), url: '/parent/reports', icon: BarChart3, requiredFeature: FEATURES.ADVANCED_ANALYTICS },
    { title: t('nav.parent.profile'), url: '/parent/profile', icon: UserCircle },
    { title: t('nav.parent.consent'), url: '/parent/consent', icon: Shield },
    { title: t('nav.parent.subscription'), url: '/parent/subscription', icon: Crown },
    { title: t('nav.parent.support'), url: '/parent/support', icon: Headphones },
  ];

  return { navItems, mobileFixedItems, mobileMoreItems };
}

function ParentSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { logout, user } = useAuth();
  const location = useLocation();
  const { hasFeature } = useAllFeatures();
  const t = useT();
  const { navItems } = useNavItems();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-3">
          {!collapsed && (
            <div>
              <img src={kivaraLogo} alt="KIVARA" className="h-9 brightness-0 invert" />
              <p className="text-small text-sidebar-foreground/50 font-body mt-0.5">{t('nav.parent.slogan')}</p>
            </div>
          )}
          {collapsed && <span className="text-xl font-display font-bold text-sidebar-primary">K</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-caption uppercase tracking-widest">{t('nav.parent.menu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const locked = item.requiredFeature ? !hasFeature(item.requiredFeature) : false;
                return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    {locked ? (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center gap-2 px-3 py-2.5 rounded-xl opacity-50 cursor-not-allowed select-none min-h-[44px]">
                              <item.icon className="mr-2 h-5 w-5" />
                              {!collapsed && <span className="text-sm">{item.title}</span>}
                              {!collapsed && <Lock className="h-3.5 w-3.5 ml-auto text-muted-foreground" />}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-small">{t('common.requires_upgrade')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                    <NavLink
                      to={item.url}
                      end={item.url === '/parent'}
                      className="hover:bg-sidebar-accent/50 rounded-xl transition-all duration-200 min-h-[44px]"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm"
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                );
              })}
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
                <p className="text-caption text-sidebar-foreground/50 uppercase tracking-wider">{t('nav.parent.role')}</p>
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

export function ParentLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const { hasFeature } = useAllFeatures();
  const [moreOpen, setMoreOpen] = useState(false);
  const t = useT();
  const { mobileFixedItems, mobileMoreItems } = useNavItems();

  const isMoreRouteActive = mobileMoreItems.some((item) =>
    location.pathname === item.url || location.pathname.startsWith(item.url + '/')
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <ParentSidebar />}
        <div className="flex-1 flex flex-col">
          <header className="relative z-50">
            <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-b border-border/50" />
            <div className="relative h-16 flex items-center justify-between px-4 gap-4">
              <div className="flex items-center gap-4">
                {!isMobile && <SidebarTrigger />}
                <img src={kivaraLogo} alt="KIVARA" className="h-8 opacity-70" />
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
              className={`flex-1 p-4 md:p-6 overflow-auto ${isMobile ? 'pb-28' : ''}`}
            >
              {children}
            </motion.main>
          </AnimatePresence>

          {isMobile && (
            <nav className="fixed bottom-0 left-0 right-0 z-40" role="navigation" aria-label={t('common.more_options')}>
              <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border/50" />
              <div className="relative px-2 py-2.5 flex justify-around items-center max-w-lg mx-auto">
                {mobileFixedItems.map((item) => {
                  const isActive = item.url === '/parent'
                    ? location.pathname === '/parent'
                    : location.pathname.startsWith(item.url);

                  return (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      end={item.url === '/parent'}
                      className="relative flex flex-col items-center min-w-[48px] min-h-[48px] justify-center rounded-2xl transition-all duration-200 text-muted-foreground"
                      activeClassName="text-primary"
                    >
                      <div className="relative p-2 rounded-xl">
                        {isActive && (
                          <motion.div
                            layoutId="parent-nav-bg"
                            className="absolute inset-0 rounded-xl bg-primary/10"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        <item.icon className={`h-6 w-6 relative z-10 transition-colors duration-200 ${isActive ? 'text-primary' : ''}`} />
                      </div>
                      <span className={`text-caption mt-0.5 font-semibold ${isActive ? 'text-primary' : ''}`}>
                        {item.title}
                      </span>
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
                  const locked = item.requiredFeature ? !hasFeature(item.requiredFeature) : false;
                  const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/');

                  if (locked) {
                    return (
                      <div
                        key={item.url}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-muted-foreground/40 cursor-not-allowed select-none"
                        title={t('common.requires_upgrade')}
                      >
                        <div className="relative w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                          <item.icon className="h-6 w-6" />
                          <Lock className="h-3.5 w-3.5 absolute -top-1 -right-1 text-muted-foreground/60" />
                        </div>
                        <span className="text-xs font-semibold">{item.title}</span>
                      </div>
                    );
                  }

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

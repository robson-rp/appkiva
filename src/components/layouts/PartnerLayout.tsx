import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, BarChart3, LogOut, Settings, Crown, MoreHorizontal } from 'lucide-react';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useT } from '@/contexts/LanguageContext';

function usePartnerNav() {
  const t = useT();
  const navItems = [
    { title: t('nav.partner.dashboard'), url: '/partner', icon: LayoutDashboard },
    { title: t('nav.partner.programs'), url: '/partner/programs', icon: Users },
    { title: t('nav.partner.challenges'), url: '/partner/challenges', icon: Trophy },
    { title: t('nav.partner.reports'), url: '/partner/reports', icon: BarChart3 },
    { title: t('nav.partner.subscription'), url: '/partner/subscription', icon: Crown },
    { title: t('nav.partner.profile'), url: '/partner/profile', icon: Settings },
  ];

  const mobileFixedItems = [
    { title: t('nav.partner.dashboard'), url: '/partner', icon: LayoutDashboard },
    { title: t('nav.partner.programs'), url: '/partner/programs', icon: Users },
    { title: t('nav.partner.challenges'), url: '/partner/challenges', icon: Trophy },
    { title: t('nav.partner.reports'), url: '/partner/reports', icon: BarChart3 },
  ];

  const mobileMoreItems = [
    { title: t('nav.partner.subscription'), url: '/partner/subscription', icon: Crown },
    { title: t('nav.partner.profile'), url: '/partner/profile', icon: Settings },
  ];

  return { navItems, mobileFixedItems, mobileMoreItems };
}

function PartnerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { logout, user } = useAuth();
  const t = useT();
  const { navItems } = usePartnerNav();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-3">
          {!collapsed && (
            <div>
              <img src={kivaraLogo} alt="KIVARA" className="h-9 brightness-0 invert" />
              <p className="text-small text-sidebar-foreground/50 font-body mt-0.5">{t('nav.partner.slogan')}</p>
            </div>
          )}
          {collapsed && <span className="text-xl font-display font-bold text-sidebar-primary">K</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-caption uppercase tracking-widest">{t('nav.partner.menu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/partner'}
                      className="hover:bg-sidebar-accent/50 rounded-xl transition-all duration-200 min-h-[44px]"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm"
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
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
                <p className="text-caption text-sidebar-foreground/50 uppercase tracking-wider">{t('nav.partner.role')}</p>
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

export function PartnerLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const t = useT();
  const { mobileFixedItems, mobileMoreItems } = usePartnerNav();

  const isMoreRouteActive = mobileMoreItems.some((item) =>
    location.pathname === item.url || location.pathname.startsWith(item.url + '/')
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <PartnerSidebar />}
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
                  const isActive = item.url === '/partner'
                    ? location.pathname === '/partner'
                    : location.pathname.startsWith(item.url);

                  return (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      end={item.url === '/partner'}
                      className="relative flex flex-col items-center min-w-[48px] min-h-[48px] justify-center rounded-2xl transition-all duration-200 text-muted-foreground"
                      activeClassName="text-primary"
                    >
                      <div className="relative p-2 rounded-xl">
                        {isActive && (
                          <motion.div
                            layoutId="partner-nav-bg"
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

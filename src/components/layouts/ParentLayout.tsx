import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ListTodo, Wallet, BarChart3, LogOut, UserCircle, Gift, PiggyBank, Crown, Shield, Lock, Home, MoreHorizontal } from 'lucide-react';
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

const navItems: { title: string; url: string; icon: any; requiredFeature?: FeatureKey }[] = [
  { title: 'Painel', url: '/parent', icon: LayoutDashboard },
  { title: 'Crianças', url: '/parent/children', icon: Users },
  { title: 'Tarefas', url: '/parent/tasks', icon: ListTodo },
  { title: 'Mesada', url: '/parent/allowance', icon: Wallet },
  { title: 'Cofres', url: '/parent/vaults', icon: PiggyBank, requiredFeature: FEATURES.SAVINGS_VAULTS },
  { title: 'Recompensas', url: '/parent/rewards', icon: Gift, requiredFeature: FEATURES.CUSTOM_REWARDS },
  { title: 'Relatórios', url: '/parent/reports', icon: BarChart3, requiredFeature: FEATURES.ADVANCED_ANALYTICS },
  { title: 'Perfil', url: '/parent/profile', icon: UserCircle },
  { title: 'Consentimento', url: '/parent/consent', icon: Shield },
  { title: 'Subscrição', url: '/parent/subscription', icon: Crown },
];

const mobileNavItems = [
  { title: 'Painel', url: '/parent', icon: LayoutDashboard },
  { title: 'Crianças', url: '/parent/children', icon: Users },
  { title: 'Tarefas', url: '/parent/tasks', icon: ListTodo },
  { title: 'Mesada', url: '/parent/allowance', icon: Wallet },
  { title: 'Perfil', url: '/parent/profile', icon: UserCircle },
];

function ParentSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { logout, user } = useAuth();
  const location = useLocation();
  const { hasFeature } = useAllFeatures();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-3">
          {!collapsed && (
            <div>
              <img src={kivaraLogo} alt="KIVARA" className="h-7 brightness-0 invert" />
              <p className="text-small text-sidebar-foreground/50 font-body mt-0.5">Pequenos hábitos. Grandes futuros.</p>
            </div>
          )}
          {collapsed && <span className="text-xl font-display font-bold text-sidebar-primary">K</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-caption uppercase tracking-widest">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const locked = item.requiredFeature ? !hasFeature(item.requiredFeature) : false;
                return (
                <SidebarMenuItem key={item.title}>
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
                            <p className="text-small">Requer upgrade</p>
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
                <p className="text-caption text-sidebar-foreground/50 uppercase tracking-wider">Encarregado</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'default'}
            className="w-full text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-destructive/10 rounded-xl transition-all duration-200"
            onClick={logout}
            aria-label="Sair"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function ParentLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { logout } = useAuth();

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
                <img src={kivaraLogo} alt="KIVARA" className="h-6 opacity-70" />
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <NotificationDropdown />
                {isMobile && (
                  <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground rounded-2xl hover:bg-destructive/10 hover:text-destructive" aria-label="Sair">
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

          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <nav className="fixed bottom-0 left-0 right-0 z-40" role="navigation" aria-label="Navegação principal">
              <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border/50" />
              <div className="relative px-2 py-2.5 flex justify-around items-center max-w-lg mx-auto">
                {mobileNavItems.map((item) => {
                  const isActive = item.url === '/parent'
                    ? location.pathname === '/parent'
                    : location.pathname.startsWith(item.url);

                  return (
                    <NavLink
                      key={item.title}
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
              </div>
            </nav>
          )}
        </div>
      </div>
      <OnboardingWalkthrough />
    </SidebarProvider>
  );
}

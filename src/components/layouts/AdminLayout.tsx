import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, CreditCard, Globe, Shield, AlertTriangle, LogOut, ScrollText, School, DollarSign, Users, BookOpen, Sparkles, Bell, Image } from 'lucide-react';
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

const navItems = [
  { title: 'Painel Global', url: '/admin', icon: LayoutDashboard },
  { title: 'Tenants', url: '/admin/tenants', icon: Building2 },
  { title: 'Escolas', url: '/admin/schools', icon: School },
  { title: 'Utilizadores', url: '/admin/users', icon: Users },
  { title: 'Subscrições', url: '/admin/subscriptions', icon: CreditCard },
  { title: 'Finanças', url: '/admin/finance', icon: DollarSign },
  { title: 'Moedas', url: '/admin/currencies', icon: Globe },
  { title: 'Auditoria', url: '/admin/audit', icon: ScrollText },
  { title: 'Risco', url: '/admin/risk', icon: AlertTriangle },
  { title: 'Compliance', url: '/admin/compliance', icon: Shield },
  { title: 'Lições', url: '/admin/lessons', icon: BookOpen },
  { title: 'Onboarding', url: '/admin/onboarding', icon: Sparkles },
  { title: 'Notificações', url: '/admin/notifications', icon: Bell },
  { title: 'Banners', url: '/admin/banners', icon: Image },
];

const mobileNavItems = [
  { title: 'Painel', url: '/admin', icon: LayoutDashboard },
  { title: 'Tenants', url: '/admin/tenants', icon: Building2 },
  { title: 'Utilizadores', url: '/admin/users', icon: Users },
  { title: 'Finanças', url: '/admin/finance', icon: DollarSign },
  { title: 'Risco', url: '/admin/risk', icon: AlertTriangle },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { logout, user } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-3">
          {!collapsed && (
            <div>
              <img src={kivaraLogo} alt="KIVARA" className="h-9 brightness-0 invert" />
              <p className="text-small text-sidebar-foreground/50 font-body mt-0.5">Administração Global</p>
            </div>
          )}
          {collapsed && <span className="text-xl font-display font-bold text-sidebar-primary">K</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-caption uppercase tracking-widest">Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
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
                <p className="text-caption text-sidebar-foreground/50 uppercase tracking-wider">Admin</p>
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

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <AdminSidebar />}
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
                  const isActive = item.url === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.url);

                  return (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      end={item.url === '/admin'}
                      className="relative flex flex-col items-center min-w-[48px] min-h-[48px] justify-center rounded-2xl transition-all duration-200 text-muted-foreground"
                      activeClassName="text-primary"
                    >
                      <div className="relative p-2 rounded-xl">
                        {isActive && (
                          <motion.div
                            layoutId="admin-nav-bg"
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

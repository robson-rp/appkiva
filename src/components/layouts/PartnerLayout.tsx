import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, BarChart3, LogOut, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import kivaraLogo from '@/assets/logo-kivara.svg';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { OnboardingWalkthrough } from '@/components/OnboardingWalkthrough';

const navItems = [
  { title: 'Dashboard', url: '/partner', icon: LayoutDashboard },
  { title: 'Programas', url: '/partner/programs', icon: Users },
  { title: 'Desafios', url: '/partner/challenges', icon: Trophy },
  { title: 'Relatórios', url: '/partner/reports', icon: BarChart3 },
];

function PartnerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { logout, user } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-3">
          {!collapsed && (
            <div>
              <img src={kivaraLogo} alt="KIVARA" className="h-7 brightness-0 invert" />
              <p className="text-[11px] text-sidebar-foreground/50 font-body mt-0.5">Parceiro Institucional</p>
            </div>
          )}
          {collapsed && <span className="text-xl font-display font-bold text-sidebar-primary">K</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/partner'}
                      className="hover:bg-sidebar-accent/50 rounded-xl transition-all duration-200"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          {!collapsed && user && (
            <div className="mb-3 flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/30">
              <div className="w-9 h-9 rounded-xl bg-sidebar-accent flex items-center justify-center text-lg">
                {user.avatar}
              </div>
              <div>
                <p className="text-sm font-display font-bold text-sidebar-foreground">{user.name}</p>
                <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Parceiro</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'default'}
            className="w-full text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-destructive/10 rounded-xl transition-all duration-200"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function PartnerLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PartnerSidebar />
        <div className="flex-1 flex flex-col">
          <header className="relative z-50">
            <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-b border-border/50" />
            <div className="relative h-14 flex items-center justify-between px-4 gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <img src={kivaraLogo} alt="KIVARA" className="h-5 opacity-70" />
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
              </div>
            </div>
          </header>
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 20, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 p-4 md:p-6 overflow-auto"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
      <OnboardingWalkthrough />
    </SidebarProvider>
  );
}

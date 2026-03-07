import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, LogOut, UserCircle, GraduationCap, School } from 'lucide-react';
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
import { mockChallenges } from '@/data/mock-data';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

// Active challenges nearing completion (≥50% progress)
const urgentChallenges = mockChallenges.filter(
  c => c.status === 'active' && (c.currentAmount / c.targetAmount) >= 0.5
);
const urgentChallengesCount = urgentChallenges.length;
const hasCriticalChallenges = urgentChallenges.some(c => (c.currentAmount / c.targetAmount) >= 0.8);

const navItems = [
  { title: 'Painel', url: '/teacher', icon: LayoutDashboard },
  { title: 'Turmas', url: '/teacher/classes', icon: Users },
  { title: 'Desafios', url: '/teacher/challenges', icon: Trophy, badge: urgentChallengesCount },
];

function TeacherSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-3">
          {!collapsed && (
            <div>
              <img src={kivaraLogo} alt="KIVARA" className="h-7 brightness-0 invert" />
              <p className="text-[11px] text-sidebar-foreground/50 font-body mt-0.5">Modo Escolar</p>
            </div>
          )}
          {collapsed && <GraduationCap className="h-5 w-5 text-sidebar-primary" />}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/teacher'}
                      className="hover:bg-sidebar-accent/50 rounded-xl transition-all duration-200"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {!collapsed && item.badge ? (
                        <HoverCard openDelay={150} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <button type="button" onClick={(e) => e.preventDefault()} className="ml-auto cursor-help">
                              <Badge className={`h-5 min-w-5 px-1.5 text-[10px] bg-destructive text-destructive-foreground border-0 ${hasCriticalChallenges ? 'animate-pulse' : ''}`}>{item.badge}</Badge>
                            </button>
                          </HoverCardTrigger>
                          <HoverCardContent side="right" className="w-56 p-3 space-y-1.5">
                            <p className="font-display font-bold text-xs">Desafios próximos de terminar</p>
                            {urgentChallenges.map(ch => (
                              <button
                                key={ch.id}
                                type="button"
                                onClick={() => navigate('/teacher/challenges')}
                                className="flex items-center justify-between gap-2 text-[11px] w-full rounded-lg px-2 py-1 hover:bg-accent/50 transition-colors text-left"
                              >
                                <span>{ch.icon} {ch.title}</span>
                                <span className="font-bold text-primary">{Math.round((ch.currentAmount / ch.targetAmount) * 100)}%</span>
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
            <div className="mb-3 flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/30">
              <div className="w-9 h-9 rounded-xl bg-sidebar-accent flex items-center justify-center text-lg">
                {user.avatar}
              </div>
              <div>
                <p className="text-sm font-display font-bold text-sidebar-foreground">{user.name}</p>
                <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Professor</p>
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

export function TeacherLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <TeacherSidebar />}
        <div className="flex-1 flex flex-col">
          <header className="relative z-50">
            <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-b border-border/50" />
            <div className="relative h-14 flex items-center justify-between px-4 gap-4">
              <div className="flex items-center gap-4">
                {!isMobile && <SidebarTrigger />}
                <div className="flex items-center gap-2">
                  <img src={kivaraLogo} alt="KIVARA" className="h-5 opacity-70" />
                  <span className="text-[10px] font-display font-semibold text-muted-foreground bg-secondary/10 text-secondary px-2 py-0.5 rounded-lg">ESCOLA</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <NotificationDropdown />
                {isMobile && (
                  <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground rounded-2xl h-9 w-9 hover:bg-destructive/10 hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
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
              className={`flex-1 p-4 md:p-6 overflow-auto ${isMobile ? 'pb-24' : ''}`}
            >
              {children}
            </motion.main>
          </AnimatePresence>

          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <nav className="fixed bottom-0 left-0 right-0 z-40">
              <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border/50" />
              <div className="relative px-3 py-2 flex justify-around items-center max-w-lg mx-auto">
                {navItems.map((item) => {
                  const isActive = item.url === '/teacher'
                    ? location.pathname === '/teacher'
                    : location.pathname.startsWith(item.url);

                  return (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      end={item.url === '/teacher'}
                      className="relative flex flex-col items-center py-1.5 px-5 rounded-2xl transition-all duration-200 text-muted-foreground"
                      activeClassName="text-primary"
                    >
                      <div className="relative p-2 rounded-xl">
                        {item.badge ? (
                          <span className={`absolute -top-0.5 -right-0.5 z-20 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-1 ${hasCriticalChallenges ? 'animate-pulse' : ''}`}>{item.badge}</span>
                        ) : null}
                        {isActive && (
                          <motion.div
                            layoutId="teacher-nav-bg"
                            className="absolute inset-0 rounded-xl bg-primary/10"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        <motion.div
                          animate={isActive ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <item.icon className={`h-5 w-5 relative z-10 transition-colors duration-200 ${isActive ? 'text-primary' : ''}`} />
                        </motion.div>
                      </div>
                      <motion.span
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`text-[10px] mt-0.5 font-semibold ${isActive ? 'text-primary' : ''}`}
                      >
                        {item.title}
                      </motion.span>
                      {isActive && (
                        <motion.div
                          layoutId="teacher-nav-dot"
                          className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
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
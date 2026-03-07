import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Wallet, Target, PiggyBank, ShoppingBag, Trophy, LogOut, BookOpen, Sparkles, Lock, UserCircle, MoreHorizontal, Award, Flame } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import kivaraLogo from '@/assets/logo-kivara.svg';
import { AnimatePresence, motion } from 'framer-motion';
import { OnboardingWalkthrough } from '@/components/OnboardingWalkthrough';
import { useAllFeatures, FEATURES, FeatureKey } from '@/hooks/use-feature-gate';
import { XPProgressBar } from '@/components/XPProgressBar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const bottomNavItems: { title: string; url: string; icon: any; requiredFeature?: FeatureKey }[] = [
  { title: 'Início', url: '/child', icon: Home },
  { title: 'Carteira', url: '/child/wallet', icon: Wallet },
  { title: 'Tarefas', url: '/child/tasks', icon: Target },
  { title: 'Aprender', url: '/child/learn', icon: BookOpen },
];

const moreMenuItems: { title: string; url: string; icon: any; requiredFeature?: FeatureKey }[] = [
  { title: 'Cofres', url: '/child/vaults', icon: PiggyBank, requiredFeature: FEATURES.SAVINGS_VAULTS },
  { title: 'Sonhos', url: '/child/dreams', icon: Sparkles, requiredFeature: FEATURES.DREAM_VAULTS },
  { title: 'Missões', url: '/child/missions', icon: Target },
  { title: 'Loja', url: '/child/store', icon: ShoppingBag },
  { title: 'Conquistas', url: '/child/achievements', icon: Trophy },
  { title: 'Badges', url: '/child/badges', icon: Award },
  { title: 'Streaks', url: '/child/streaks', icon: Flame },
  { title: 'Diário', url: '/child/diary', icon: BookOpen },
];

export function ChildLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasFeature } = useAllFeatures();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreRouteActive = moreMenuItems.some((item) =>
    location.pathname === item.url || location.pathname.startsWith(item.url + '/')
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="relative z-50">
        <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-b border-border/50" />
        <div className="relative flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl shadow-lg shadow-primary/20">
              {user?.avatar}
            </div>
            <div>
              <img src={kivaraLogo} alt="KIVARA" className="h-4 opacity-60" />
              <p className="text-base font-display font-bold text-foreground">
                Olá, {user?.name}! <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite]">👋</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NavLink to="/child/profile" className="relative p-2.5 rounded-2xl hover:bg-muted/80 transition-all duration-200 active:scale-95" aria-label="Perfil">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
            </NavLink>
            <ThemeToggle />
            <NotificationDropdown />
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200 active:scale-95" aria-label="Sair">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* XP Progress Bar */}
      <XPProgressBar />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.main
          id="main-content"
          role="main"
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 p-4 pb-28 overflow-auto"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40" role="navigation" aria-label="Navegação principal">
        <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border/50" />
        <div className="relative px-2 py-2.5 flex justify-around items-center max-w-lg mx-auto">
          {bottomNavItems.map((item) => {
            const isActive = item.url === '/child'
              ? location.pathname === '/child'
              : location.pathname.startsWith(item.url);

            return (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === '/child'}
                className="relative flex flex-col items-center min-w-[48px] min-h-[48px] justify-center rounded-2xl transition-all duration-200 text-muted-foreground"
                activeClassName="text-primary"
              >
                <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10' : ''}`}>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className={`h-6 w-6 relative z-10 transition-all duration-200 ${isActive ? 'text-primary' : ''}`} />
                </div>
                <span className={`text-caption mt-0.5 font-semibold transition-all duration-200 ${isActive ? 'text-primary' : ''}`}>
                  {item.title}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`relative flex flex-col items-center min-w-[48px] min-h-[48px] justify-center rounded-2xl transition-all duration-200 ${isMoreRouteActive ? 'text-primary' : 'text-muted-foreground'}`}
            aria-label="Mais opções"
          >
            <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isMoreRouteActive ? 'bg-primary/10' : ''}`}>
              <MoreHorizontal className="h-6 w-6 relative z-10" />
            </div>
            <span className="text-caption mt-0.5 font-semibold">Mais</span>
            {isMoreRouteActive && (
              <div className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </nav>

      {/* More Menu Sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-8">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-center text-lg font-display">Mais funcionalidades</SheetTitle>
          </SheetHeader>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-3 gap-3 pt-2"
          >
            {moreMenuItems.map((item) => {
              const locked = item.requiredFeature ? !hasFeature(item.requiredFeature) : false;
              const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/');

              if (locked) {
                return (
                  <div
                    key={item.title}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-muted-foreground/40 cursor-not-allowed select-none"
                    title="Requer upgrade"
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
                  key={item.title}
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

      <OnboardingWalkthrough />
    </div>
  );
}

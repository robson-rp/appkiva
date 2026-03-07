import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Wallet, Target, PiggyBank, ShoppingBag, Trophy, LogOut, BookOpen, Sparkles, Lock, UserCircle } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
nts/NotificationDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import kivaraLogo from '@/assets/logo-kivara.svg';
import { AnimatePresence, motion } from 'framer-motion';
import { OnboardingWalkthrough } from '@/components/OnboardingWalkthrough';
import { useAllFeatures, FEATURES, FeatureKey } from '@/hooks/use-feature-gate';
import { XPProgressBar } from '@/components/XPProgressBar';

const bottomNavItems: { title: string; url: string; icon: any; requiredFeature?: FeatureKey }[] = [
  { title: 'Início', url: '/child', icon: Home },
  { title: 'Carteira', url: '/child/wallet', icon: Wallet },
  { title: 'Aprender', url: '/child/learn', icon: BookOpen },
  { title: 'Cofres', url: '/child/vaults', icon: PiggyBank, requiredFeature: FEATURES.SAVINGS_VAULTS },
  { title: 'Sonhos', url: '/child/dreams', icon: Sparkles, requiredFeature: FEATURES.DREAM_VAULTS },
  { title: 'Loja', url: '/child/store', icon: ShoppingBag },
];

export function ChildLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const child = mockChildren[0];
  const { hasFeateturn (
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
            <NavLink to="/child/achievements" className="relative p-2.5 rounded-2xl hover:bg-muted/80 transition-all duration-200 active:scale-95" aria-label="Conquistas">
              <Trophy className="h-5 w-5 text-muted-foreground" />
            </NavLink>
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
            const locked = item.requiredFeature ? !hasFeature(item.requiredFeature) : false;
            const isActive = !locked && (item.url === '/child'
              ? location.pathname === '/child'
              : location.pathname.startsWith(item.url));

            if (locked) {
              return (
                <div
                  key={item.title}
                  className="relative flex flex-col items-center min-w-[48px] min-h-[48px] justify-center rounded-2xl text-muted-foreground/40 cursor-not-allowed select-none"
                  title="Requer upgrade"
                >
                  <div className="relative p-1.5 rounded-xl">
                    <item.icon className="h-6 w-6" />
                    <Lock className="h-3 w-3 absolute -top-0.5 -right-0.5 text-muted-foreground/60" />
                  </div>
                  <span className="text-caption mt-0.5 font-semibold">{item.title}</span>
                </div>
              );
            }

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
        </div>
      </nav>
      <OnboardingWalkthrough />
    </div>
  );
}

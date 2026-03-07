import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Wallet, Target, PiggyBank, BarChart3, LogOut, BookOpen, Lock } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { mockTeens } from '@/data/mock-data';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import kivaraLogo from '@/assets/logo-kivara.svg';
import { AnimatePresence, motion } from 'framer-motion';
import { OnboardingWalkthrough } from '@/components/OnboardingWalkthrough';
import { useAllFeatures, FEATURES, FeatureKey } from '@/hooks/use-feature-gate';

const bottomNavItems: { title: string; url: string; icon: any; requiredFeature?: FeatureKey }[] = [
  { title: 'Início', url: '/teen', icon: Home },
  { title: 'Carteira', url: '/teen/wallet', icon: Wallet },
  { title: 'Aprender', url: '/teen/learn', icon: BookOpen },
  { title: 'Cofres', url: '/teen/vaults', icon: PiggyBank, requiredFeature: FEATURES.SAVINGS_VAULTS },
  { title: 'Análise', url: '/teen/analytics', icon: BarChart3, requiredFeature: FEATURES.ADVANCED_ANALYTICS },
];

export function TeenLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const teen = mockTeens[0];
  const { hasFeature } = useAllFeatures();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="relative z-50">
        <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-b border-border/50" />
        <div className="relative flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-chart-3 to-chart-4 flex items-center justify-center text-2xl shadow-lg">
              {user?.avatar}
            </div>
            <div>
              <img src={kivaraLogo} alt="KIVARA" className="h-4 opacity-60" />
              <p className="text-base font-display font-bold text-foreground">
                {user?.name} <span className="text-small font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-md ml-1">TEEN</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-accent/15 rounded-full px-3.5 py-2 mr-1">
              <span className="text-base">🪙</span>
              <span className="text-base font-display font-bold text-accent-foreground">{teen.balance}</span>
            </div>
            <ThemeToggle />
            <NotificationDropdown />
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200 active:scale-95" aria-label="Sair">
              <LogOut className="h-5 w-5" />
            </Button>
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
          className="flex-1 p-4 pb-28 overflow-auto"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-40" role="navigation" aria-label="Navegação principal">
        <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border/50" />
        <div className="relative px-2 py-2.5 flex justify-around items-center max-w-lg mx-auto">
          {bottomNavItems.map((item) => {
            const locked = item.requiredFeature ? !hasFeature(item.requiredFeature) : false;
            const isActive = !locked && (item.url === '/teen'
              ? location.pathname === '/teen'
              : location.pathname.startsWith(item.url));

            if (locked) {
              return (
                <div
                  key={item.title}
                  className="relative flex flex-col items-center min-w-[48px] min-h-[48px] justify-center rounded-2xl text-muted-foreground/40 cursor-not-allowed select-none"
                  title="Requer upgrade"
                >
                  <div className="relative p-2 rounded-xl">
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
                end={item.url === '/teen'}
                className="relative flex flex-col items-center min-w-[48px] min-h-[48px] justify-center rounded-2xl transition-all duration-200 text-muted-foreground"
                activeClassName="text-primary"
              >
                <div className="relative p-2 rounded-xl">
                  {isActive && (
                    <motion.div
                      layoutId="teen-nav-bg"
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
                {isActive && (
                  <motion.div
                    layoutId="teen-nav-dot"
                    className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
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

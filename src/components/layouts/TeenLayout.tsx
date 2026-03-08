import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Wallet, Target, PiggyBank, BarChart3, LogOut, BookOpen, Lock, UserCircle, MoreHorizontal, Award, Flame } from 'lucide-react';
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
import { useT } from '@/contexts/LanguageContext';

function useTeenNav() {
  const t = useT();
  const bottomNavItems: { title: string; url: string; icon: any }[] = [
    { title: t('nav.teen.home'), url: '/teen', icon: Home },
    { title: t('nav.teen.wallet'), url: '/teen/wallet', icon: Wallet },
    { title: t('nav.teen.tasks'), url: '/teen/tasks', icon: Target },
    { title: t('nav.teen.learn'), url: '/teen/learn', icon: BookOpen },
  ];

  const moreMenuItems: { title: string; url: string; icon: any; requiredFeature?: FeatureKey }[] = [
    { title: t('nav.teen.vaults'), url: '/teen/vaults', icon: PiggyBank, requiredFeature: FEATURES.SAVINGS_VAULTS },
    { title: t('nav.teen.missions'), url: '/teen/missions', icon: Target },
    { title: t('nav.teen.analytics'), url: '/teen/analytics', icon: BarChart3, requiredFeature: FEATURES.ADVANCED_ANALYTICS },
    { title: t('nav.teen.badges'), url: '/teen/badges', icon: Award },
    { title: t('nav.teen.streaks'), url: '/teen/streaks', icon: Flame },
  ];

  return { bottomNavItems, moreMenuItems };
}

export function TeenLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasFeature } = useAllFeatures();
  const [moreOpen, setMoreOpen] = useState(false);
  const t = useT();
  const { bottomNavItems, moreMenuItems } = useTeenNav();

  const isMoreRouteActive = moreMenuItems.some((item) =>
    location.pathname === item.url || location.pathname.startsWith(item.url + '/')
  );

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
              <img src={kivaraLogo} alt="KIVARA" className="h-7 opacity-60" />
              <p className="text-base font-display font-bold text-foreground">
                {user?.name} <span className="text-small font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-md ml-1">TEEN</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NavLink to="/teen/profile" className="relative p-2.5 rounded-2xl hover:bg-muted/80 transition-all duration-200 active:scale-95" aria-label={t('nav.teen.profile')}>
              <UserCircle className="h-5 w-5 text-muted-foreground" />
            </NavLink>
            <NotificationDropdown />
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200 active:scale-95" aria-label={t('common.logout')}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <XPProgressBar />

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

      <nav className="fixed bottom-0 left-0 right-0 z-40" role="navigation" aria-label={t('common.more_options')}>
        <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border/50" />
        <div className="relative px-2 py-2.5 flex justify-around items-center max-w-lg mx-auto">
          {bottomNavItems.map((item) => {
            const isActive = item.url === '/teen'
              ? location.pathname === '/teen'
              : location.pathname.startsWith(item.url);

            return (
              <NavLink
                key={item.url}
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
            {moreMenuItems.map((item) => {
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

      <OnboardingWalkthrough />
    </div>
  );
}

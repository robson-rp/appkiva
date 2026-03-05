import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Wallet, Target, PiggyBank, ShoppingBag, Trophy, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { mockChildren } from '@/data/mock-data';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { Button } from '@/components/ui/button';
import kivaraLogo from '@/assets/logo-kivara.svg';
import { AnimatePresence, motion } from 'framer-motion';

const bottomNavItems = [
  { title: 'Início', url: '/child', icon: Home },
  { title: 'Carteira', url: '/child/wallet', icon: Wallet },
  { title: 'Missões', url: '/child/missions', icon: Target },
  { title: 'Cofres', url: '/child/vaults', icon: PiggyBank },
  { title: 'Loja', url: '/child/store', icon: ShoppingBag },
];

export function ChildLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const child = mockChildren[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Premium Header */}
      <header className="relative z-50">
        <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-b border-border/50" />
        <div className="relative flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl shadow-lg shadow-primary/20">
              {user?.avatar}
            </div>
            <div>
              <img src={kivaraLogo} alt="KIVARA" className="h-4 opacity-60" />
              <p className="text-sm font-display font-bold text-foreground">
                Olá, {user?.name}! <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite]">👋</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Coin balance pill */}
            <div className="flex items-center gap-1.5 bg-accent/15 rounded-full px-3 py-1.5 mr-1">
              <span className="text-sm">🪙</span>
              <span className="text-sm font-display font-bold text-accent-foreground">{child.balance}</span>
            </div>
            <NavLink to="/child/achievements" className="relative p-2.5 rounded-2xl hover:bg-muted/80 transition-all duration-200 active:scale-95">
              <Trophy className="h-4.5 w-4.5 text-muted-foreground" />
            </NavLink>
            <NotificationDropdown />
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground rounded-2xl h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 active:scale-95">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content with page transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex-1 p-4 pb-24 overflow-auto"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Premium Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border/50" />
        <div className="relative px-3 py-2 flex justify-around items-center max-w-lg mx-auto">
          {bottomNavItems.map((item) => {
            const isActive = item.url === '/child'
              ? location.pathname === '/child'
              : location.pathname.startsWith(item.url);

            return (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === '/child'}
                className="relative flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all duration-200 text-muted-foreground"
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
                  <item.icon className={`h-5 w-5 relative z-10 transition-all duration-200 ${isActive ? 'text-primary' : ''}`} />
                </div>
                <span className={`text-[10px] mt-0.5 font-semibold transition-all duration-200 ${isActive ? 'text-primary' : ''}`}>
                  {item.title}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

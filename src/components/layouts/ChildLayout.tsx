import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Wallet, Target, PiggyBank, ShoppingBag, Trophy, Bell, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { mockNotifications } from '@/data/mock-data';
import { Button } from '@/components/ui/button';

const bottomNavItems = [
  { title: 'Início', url: '/child', icon: Home },
  { title: 'Carteira', url: '/child/wallet', icon: Wallet },
  { title: 'Missões', url: '/child/missions', icon: Target },
  { title: 'Cofres', url: '/child/vaults', icon: PiggyBank },
  { title: 'Loja', url: '/child/store', icon: ShoppingBag },
];

export function ChildLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 bg-card border-b">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{user?.avatar}</span>
          <div>
            <h1 className="font-display text-sm font-bold text-primary">KIVARA</h1>
            <p className="text-xs text-muted-foreground">Olá, {user?.name}!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/child/achievements" className="relative p-2 rounded-full hover:bg-muted transition-colors">
            <Trophy className="h-5 w-5 text-muted-foreground" />
          </NavLink>
          <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 pb-20 overflow-auto">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t px-2 py-1 flex justify-around items-center z-40">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === '/child'}
            className="flex flex-col items-center py-1 px-2 rounded-lg text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 font-semibold">{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

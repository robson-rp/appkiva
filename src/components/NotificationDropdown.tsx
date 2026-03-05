import { useState } from 'react';
import { Bell, CheckCheck, ListTodo, Target, Trophy, PiggyBank } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockNotifications } from '@/data/mock-data';
import { Notification } from '@/types/kivara';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const typeConfig: Record<Notification['type'], { icon: typeof Bell; bg: string }> = {
  task: { icon: ListTodo, bg: 'bg-[hsl(var(--kivara-light-blue))]' },
  mission: { icon: Target, bg: 'bg-[hsl(var(--kivara-light-gold))]' },
  achievement: { icon: Trophy, bg: 'bg-[hsl(var(--kivara-light-green))]' },
  savings: { icon: PiggyBank, bg: 'bg-[hsl(var(--kivara-purple))]' },
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const relativeDate = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    return `Há ${diff} dias`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2.5 rounded-2xl hover:bg-muted/80 transition-all duration-200 active:scale-95">
          <Bell className="h-[18px] w-[18px] text-muted-foreground" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm"
            >
              {unreadCount}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0 rounded-2xl border-border/50 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
          <div>
            <h3 className="font-display font-bold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <p className="text-[10px] text-muted-foreground">{unreadCount} por ler</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-primary h-7 rounded-lg gap-1 hover:bg-primary/10" onClick={markAllRead}>
              <CheckCheck className="h-3 w-3" /> Marcar tudo
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Sem notificações 🎉</div>
            ) : (
              notifications.map((notif, i) => {
                const config = typeConfig[notif.type];
                const Icon = config.icon;
                return (
                  <motion.button
                    key={notif.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => markRead(notif.id)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors duration-150 border-b border-border/30 last:border-0 ${!notif.read ? 'bg-primary/[0.03]' : ''}`}
                  >
                    <div className={`${config.bg} rounded-xl p-2 shrink-0 mt-0.5`}>
                      <Icon className="h-3.5 w-3.5 text-foreground/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-display ${!notif.read ? 'font-bold' : 'font-medium'} truncate`}>{notif.title}</p>
                        {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{relativeDate(notif.date)}</p>
                    </div>
                  </motion.button>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
}

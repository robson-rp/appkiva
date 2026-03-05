import { useState, useEffect } from 'react';
import { Bell, CheckCheck, ListTodo, Target, Trophy, PiggyBank, Flame, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockNotifications } from '@/data/mock-data';
import { mockStreakData } from '@/data/streaks-data';
import { Notification } from '@/types/kivara';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { hapticLight } from '@/lib/celebration-effects';

function generateStreakNotifications(): Notification[] {
  const now = new Date();
  const lastActive = new Date(mockStreakData.lastActiveDate);
  const hoursSinceLast = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
  const notifs: Notification[] = [];

  if (hoursSinceLast >= 18 && mockStreakData.currentStreak > 0) {
    const hoursLeft = Math.max(0, Math.round(24 - hoursSinceLast));
    notifs.push({
      id: 'streak-warn',
      title: '🔥 Sequência em risco!',
      message: hoursLeft > 0
        ? `Tens ${hoursLeft}h para manter a tua sequência de ${mockStreakData.currentStreak} dias! Completa uma actividade agora.`
        : `A tua sequência de ${mockStreakData.currentStreak} dias está prestes a acabar! Age agora!`,
      type: 'streak',
      read: false,
      date: now.toISOString().split('T')[0],
      urgent: true,
    });
  }

  const nextMilestone = mockStreakData.streakRewards.find(r => !r.claimed && r.days > mockStreakData.currentStreak);
  if (nextMilestone && nextMilestone.days - mockStreakData.currentStreak <= 2) {
    notifs.push({
      id: 'streak-milestone',
      title: `${nextMilestone.icon} Quase lá!`,
      message: `Faltam apenas ${nextMilestone.days - mockStreakData.currentStreak} dia(s) para "${nextMilestone.label}" e +${nextMilestone.kivaPoints} KivaPoints!`,
      type: 'streak',
      read: false,
      date: now.toISOString().split('T')[0],
    });
  }

  return notifs;
}

const typeConfig: Record<Notification['type'], { icon: typeof Bell; bg: string }> = {
  task: { icon: ListTodo, bg: 'bg-[hsl(var(--kivara-light-blue))]' },
  mission: { icon: Target, bg: 'bg-[hsl(var(--kivara-light-gold))]' },
  achievement: { icon: Trophy, bg: 'bg-[hsl(var(--kivara-light-green))]' },
  savings: { icon: PiggyBank, bg: 'bg-[hsl(var(--kivara-purple))]' },
  streak: { icon: Flame, bg: 'bg-destructive/15' },
};

export function NotificationDropdown() {
  const streakNotifs = generateStreakNotifications();
  const [notifications, setNotifications] = useState([...streakNotifs, ...mockNotifications]);
  const [showBanner, setShowBanner] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentNotif = notifications.find(n => n.urgent && !n.read);

  // Show streak risk banner after a short delay
  useEffect(() => {
    if (urgentNotif) {
      const timer = setTimeout(() => {
        setShowBanner(true);
        hapticLight();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [urgentNotif]);

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
    <>
      {/* Streak Risk Banner */}
      <AnimatePresence>
        {showBanner && urgentNotif && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-16 left-2 right-2 z-[70] max-w-lg mx-auto"
          >
            <div className="bg-destructive text-destructive-foreground rounded-2xl p-3 shadow-lg flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-2xl shrink-0"
              >
                🔥
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-display font-bold">{urgentNotif.title}</p>
                <p className="text-[11px] opacity-90 line-clamp-2">{urgentNotif.message}</p>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="shrink-0 p-1 rounded-lg hover:bg-destructive-foreground/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors duration-150 border-b border-border/30 last:border-0 ${
                      notif.urgent && !notif.read ? 'bg-destructive/[0.06]' : !notif.read ? 'bg-primary/[0.03]' : ''
                    }`}
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
    </>
  );
}

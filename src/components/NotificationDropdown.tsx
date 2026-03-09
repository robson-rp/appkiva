import { useState, useEffect } from 'react';
import { Bell, CheckCheck, ListTodo, Target, Trophy, PiggyBank, Flame, X, Users, Archive, Volume2, VolumeX, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification, AppNotification } from '@/hooks/use-notifications';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { hapticLight, hapticUrgent, playUrgentAlert } from '@/lib/celebration-effects';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LanguageContext';

type NotifType = 'task' | 'mission' | 'achievement' | 'savings' | 'streak' | 'class' | 'reward' | 'vault';

const typeConfig: Record<NotifType, { icon: typeof Bell; bg: string }> = {
  task: { icon: ListTodo, bg: 'bg-[hsl(var(--kivara-light-blue))]' },
  mission: { icon: Target, bg: 'bg-[hsl(var(--kivara-light-gold))]' },
  achievement: { icon: Trophy, bg: 'bg-[hsl(var(--kivara-light-green))]' },
  savings: { icon: PiggyBank, bg: 'bg-[hsl(var(--kivara-purple))]' },
  streak: { icon: Flame, bg: 'bg-destructive/15' },
  class: { icon: Users, bg: 'bg-[hsl(var(--kivara-light-blue))]' },
  reward: { icon: Gift, bg: 'bg-[hsl(var(--kivara-light-gold))]' },
  vault: { icon: PiggyBank, bg: 'bg-[hsl(var(--kivara-light-green))]' },
};

export function NotificationDropdown() {
  const t = useT();
  const { user } = useAuth();

  const { data: realNotifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();

  const notifications = (realNotifications ?? []).map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: (n.type in typeConfig ? n.type : 'task') as NotifType,
    read: n.read,
    date: n.createdAt,
    urgent: n.urgent,
  }));

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentNotif = notifications.find(n => n.urgent && !n.read);

  const [showBanner, setShowBanner] = useState(false);
  const [dismissedBannerId, setDismissedBannerId] = useState<string | null>(null);
  const [muted, setMuted] = useState(() => localStorage.getItem('kivara-notif-muted') === 'true');

  const toggleMute = () => {
    setMuted(prev => {
      const next = !prev;
      localStorage.setItem('kivara-notif-muted', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (urgentNotif && urgentNotif.id !== dismissedBannerId) {
      const timer = setTimeout(() => {
        setShowBanner(true);
        if (!muted) {
          playUrgentAlert();
          hapticUrgent();
        }
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
    }
  }, [urgentNotif?.id, dismissedBannerId, muted]);

  const handleMarkRead = (id: string) => markRead.mutate(id);
  const handleMarkAllRead = () => markAllRead.mutate();
  const handleArchive = (id: string) => deleteNotif.mutate(id);

  const relativeDate = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diff === 0) return t('notif.today');
    if (diff === 1) return t('notif.yesterday');
    return t('notif.days_ago').replace('{days}', String(diff));
  };

  return (
    <>
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
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-2xl shrink-0">
                🔥
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-display font-bold">{urgentNotif.title}</p>
                <p className="text-[11px] opacity-90 line-clamp-2">{urgentNotif.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 h-7 text-[10px] font-bold text-destructive-foreground bg-destructive-foreground/15 hover:bg-destructive-foreground/25 rounded-lg gap-1 px-2"
                onClick={() => {
                  handleMarkRead(urgentNotif.id);
                  setDismissedBannerId(urgentNotif.id);
                  setShowBanner(false);
                }}
              >
                <CheckCheck className="h-3 w-3" /> {t('notif.read')}
              </Button>
              <button onClick={() => { setDismissedBannerId(urgentNotif.id); setShowBanner(false); }} className="shrink-0 p-1 rounded-lg hover:bg-destructive-foreground/10 transition-colors">
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
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
            <div>
              <h3 className="font-display font-bold text-sm">{t('notif.title')}</h3>
              {unreadCount > 0 && (
                <p className="text-[10px] text-muted-foreground">{t('notif.unread').replace('{count}', String(unreadCount))}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-lg ${muted ? 'text-muted-foreground' : 'text-primary'} hover:bg-primary/10`}
                onClick={toggleMute}
                title={muted ? t('notif.unmute') : t('notif.mute')}
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </Button>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs text-primary h-7 rounded-lg gap-1 hover:bg-primary/10" onClick={handleMarkAllRead}>
                  <CheckCheck className="h-3 w-3" /> {t('notif.mark_all')}
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            <AnimatePresence>
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-2xl mb-1">🎉</p>
                  <p className="text-sm text-muted-foreground">{t('notif.empty_title')}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">{t('notif.empty_desc')}</p>
                </div>
              ) : (
                notifications.map((notif, i) => {
                  const config = typeConfig[notif.type] ?? typeConfig.task;
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -60, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-border/30 last:border-0 ${
                        notif.urgent && !notif.read ? 'bg-destructive/[0.06]' : !notif.read ? 'bg-primary/[0.03]' : ''
                      }`}
                    >
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="flex items-start gap-3 flex-1 min-w-0 text-left hover:bg-muted/40 rounded-lg transition-colors -m-1 p-1"
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
                      </button>
                      <button
                        onClick={() => handleArchive(notif.id)}
                        className="shrink-0 p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors mt-1"
                        title={t('notif.archive')}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
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

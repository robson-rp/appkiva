import { useState, useEffect } from 'react';
import { Bell, CheckCheck, ListTodo, Target, Trophy, PiggyBank, Flame, X, Users, Archive, Volume2, VolumeX, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification, AppNotification } from '@/hooks/use-notifications';
import { mockNotifications, mockTeacherNotifications, mockChallenges } from '@/data/mock-data';
import { mockStreakData } from '@/data/streaks-data';
import { Notification } from '@/types/kivara';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { hapticLight, hapticUrgent, playUrgentAlert } from '@/lib/celebration-effects';
import { useAuth } from '@/contexts/AuthContext';

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

function generateChallengeAlerts(): Notification[] {
  return mockChallenges
    .filter(c => c.status === 'active' && (c.currentAmount / c.targetAmount) >= 0.9)
    .map(c => ({
      id: `challenge-alert-${c.id}`,
      title: '🚨 Desafio quase concluído!',
      message: `"${c.title}" atingiu ${Math.round((c.currentAmount / c.targetAmount) * 100)}% da meta. A turma está quase lá!`,
      type: 'class' as const,
      read: false,
      date: new Date().toISOString().split('T')[0],
      urgent: true,
    }));
}

type NotifType = 'task' | 'mission' | 'achievement' | 'savings' | 'streak' | 'class' | 'reward' | 'vault' | 'budget' | 'emission_80' | 'emission_100';

const typeConfig: Record<NotifType, { icon: typeof Bell; bg: string }> = {
  task: { icon: ListTodo, bg: 'bg-[hsl(var(--kivara-light-blue))]' },
  mission: { icon: Target, bg: 'bg-[hsl(var(--kivara-light-gold))]' },
  achievement: { icon: Trophy, bg: 'bg-[hsl(var(--kivara-light-green))]' },
  savings: { icon: PiggyBank, bg: 'bg-[hsl(var(--kivara-purple))]' },
  streak: { icon: Flame, bg: 'bg-destructive/15' },
  class: { icon: Users, bg: 'bg-[hsl(var(--kivara-light-blue))]' },
  reward: { icon: Gift, bg: 'bg-[hsl(var(--kivara-light-gold))]' },
  vault: { icon: PiggyBank, bg: 'bg-[hsl(var(--kivara-light-green))]' },
  budget: { icon: Bell, bg: 'bg-destructive/15' },
  emission_80: { icon: Bell, bg: 'bg-[hsl(var(--kivara-light-gold))]' },
  emission_100: { icon: Bell, bg: 'bg-destructive/15' },
};

// Unified notification shape for display
interface DisplayNotification {
  id: string;
  title: string;
  message: string;
  type: NotifType;
  read: boolean;
  date: string;
  urgent?: boolean;
  isReal?: boolean; // from database
}

export function NotificationDropdown() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  // Real notifications from database
  const { data: realNotifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();

  // Mock-based notifications (fallback / streaks / challenges)
  const streakNotifs = isTeacher ? [] : generateStreakNotifications();
  const challengeAlerts = isTeacher ? generateChallengeAlerts() : [];
  const baseMockNotifs = isTeacher ? mockTeacherNotifications : mockNotifications;

  // Convert real notifications to display format
  const realDisplay: DisplayNotification[] = (realNotifications ?? []).map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type as NotifType,
    read: n.read,
    date: n.createdAt,
    urgent: n.urgent,
    isReal: true,
  }));

  // Convert mock notifications
  const mockDisplay: DisplayNotification[] = [...challengeAlerts, ...streakNotifs, ...baseMockNotifs].map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type as NotifType,
    read: n.read,
    date: n.date,
    urgent: n.urgent,
  }));

  // If we have real notifications, show them first, then mock
  const hasReal = realDisplay.length > 0;
  const [dismissedMocks, setDismissedMocks] = useState<Set<string>>(new Set());
  
  const allNotifications = [
    ...realDisplay,
    ...(hasReal ? [] : mockDisplay.filter(n => !dismissedMocks.has(n.id))),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const unreadCount = allNotifications.filter((n) => !n.read).length;
  const urgentNotif = allNotifications.find(n => n.urgent && !n.read);

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

  const handleMarkRead = (id: string, isReal?: boolean) => {
    if (isReal) {
      markRead.mutate(id);
    }
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const handleArchive = (id: string, isReal?: boolean) => {
    if (isReal) {
      deleteNotif.mutate(id);
    } else {
      setDismissedMocks(prev => new Set(prev).add(id));
    }
  };

  const relativeDate = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    return `Há ${diff} dias`;
  };

  return (
    <>
      {/* Urgent Banner */}
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
                  handleMarkRead(urgentNotif.id, urgentNotif.isReal);
                  setDismissedBannerId(urgentNotif.id);
                  setShowBanner(false);
                }}
              >
                <CheckCheck className="h-3 w-3" /> Lida
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
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
          <div>
            <h3 className="font-display font-bold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <p className="text-[10px] text-muted-foreground">{unreadCount} por ler</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-lg ${muted ? 'text-muted-foreground' : 'text-primary'} hover:bg-primary/10`}
              onClick={toggleMute}
              title={muted ? 'Ativar som' : 'Silenciar'}
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-primary h-7 rounded-lg gap-1 hover:bg-primary/10" onClick={handleMarkAllRead}>
                <CheckCheck className="h-3 w-3" /> Marcar tudo
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto">
          <AnimatePresence>
            {allNotifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Sem notificações 🎉</div>
            ) : (
              allNotifications.map((notif, i) => {
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
                      onClick={() => handleMarkRead(notif.id, notif.isReal)}
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
                      onClick={() => handleArchive(notif.id, notif.isReal)}
                      className="shrink-0 p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors mt-1"
                      title="Arquivar"
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

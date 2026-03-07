import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Kivo } from '@/components/Kivo';
import { mockChildren, mockDiaryEntries } from '@/data/mock-data';
import { DiaryMood } from '@/types/kivara';
import { BookOpen, Flame, PenLine, CalendarDays, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDiaryEntries, useCreateDiaryEntry } from '@/hooks/use-diary-entries';
import { useAuth } from '@/contexts/AuthContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const MOODS: { emoji: DiaryMood; label: string }[] = [
  { emoji: '😄', label: 'Muito feliz' },
  { emoji: '😊', label: 'Feliz' },
  { emoji: '😐', label: 'Normal' },
  { emoji: '😔', label: 'Triste' },
  { emoji: '😤', label: 'Frustrado' },
];

function calcStreak(entries: { createdAt: string }[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  // Get unique dates
  const dates = [...new Set(sorted.map(e => new Date(e.createdAt).toISOString().split('T')[0]))];
  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const curr = new Date(dates[i]);
    const prev = new Date(dates[i + 1]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hoje';
  if (date.toDateString() === yesterday.toDateString()) return 'Ontem';

  return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
}

export default function ChildDiary() {
  const { user } = useAuth();
  const { data: dbEntries = [], isLoading } = useDiaryEntries();
  const createEntry = useCreateDiaryEntry();
  const [isWriting, setIsWriting] = useState(false);
  const [newText, setNewText] = useState('');
  const [newMood, setNewMood] = useState<DiaryMood | null>(null);

  // Fallback to mock data
  const child = mockChildren[0];
  const mockFallback = mockDiaryEntries.filter((e) => e.childId === child.id).map(e => ({
    id: e.id, profileId: '', text: e.text, mood: e.mood, tags: e.tags ?? [], createdAt: e.date,
  }));
  const entries = dbEntries.length > 0 ? dbEntries : mockFallback;

  const streak = calcStreak(entries);
  const totalEntries = entries.length;
  const moodCounts = entries.reduce((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '😊';

  const handleSubmit = async () => {
    if (!newText.trim() || !newMood) return;
    try {
      await createEntry.mutateAsync({ text: newText, mood: newMood });
      setNewText('');
      setNewMood(null);
      setIsWriting(false);
      toast({ title: 'Reflexão guardada! 📝', description: 'Continua a escrever todos os dias para manter a tua sequência!' });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível guardar a reflexão.', variant: 'destructive' });
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-2xl mx-auto pb-4">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--kivara-purple))] via-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-pink))]" />
          <div className="absolute top-[-30%] right-[-15%] w-[55%] h-[80%] rounded-full bg-white/10 blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-foreground/10 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">Diário Financeiro</h1>
                <p className="text-sm text-foreground/60 font-body">As tuas reflexões sobre dinheiro</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-foreground/5 backdrop-blur-sm rounded-2xl p-3 text-center">
                <Flame className="h-4 w-4 text-destructive mx-auto mb-1" />
                <p className="text-[10px] text-foreground/50 uppercase tracking-wider font-medium">Sequência</p>
                <motion.p
                  key={streak}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="font-display font-bold text-foreground text-xl"
                >
                  {streak} 🔥
                </motion.p>
              </div>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-2xl p-3 text-center">
                <CalendarDays className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-[10px] text-foreground/50 uppercase tracking-wider font-medium">Entradas</p>
                <p className="font-display font-bold text-foreground text-xl">{totalEntries}</p>
              </div>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-2xl p-3 text-center">
                <Sparkles className="h-4 w-4 text-accent mx-auto mb-1" />
                <p className="text-[10px] text-foreground/50 uppercase tracking-wider font-medium">Humor top</p>
                <p className="font-display font-bold text-foreground text-xl">{topMood}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* New Entry Button / Form */}
      <motion.div variants={item}>
        <AnimatePresence mode="wait">
          {!isWriting ? (
            <motion.div key="btn" exit={{ opacity: 0, scale: 0.95 }}>
              <Button
                onClick={() => setIsWriting(true)}
                className="w-full rounded-2xl font-display gap-2 h-14 text-base bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0 shadow-kivara"
              >
                <PenLine className="h-5 w-5" /> Escrever no diário
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Card className="border-border/50 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
                <CardContent className="p-4 space-y-4">
                  <div>
                    <p className="text-xs font-display font-bold mb-2">Como te sentes hoje?</p>
                    <div className="flex gap-2">
                      {MOODS.map((m) => (
                        <motion.button
                          key={m.emoji}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setNewMood(m.emoji)}
                          className={`flex-1 p-2.5 rounded-xl border-2 text-center transition-all ${
                            newMood === m.emoji
                              ? 'border-primary bg-primary/10 shadow-sm'
                              : 'border-border/50 hover:border-primary/30'
                          }`}
                        >
                          <span className="text-2xl block">{m.emoji}</span>
                          <span className="text-[9px] text-muted-foreground mt-0.5 block">{m.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-display font-bold mb-2">A tua reflexão</p>
                    <Textarea
                      placeholder="Hoje eu..."
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      className="rounded-xl min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => { setIsWriting(false); setNewText(''); setNewMood(null); }}
                      className="flex-1 rounded-xl font-display"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!newText.trim() || !newMood || createEntry.isPending}
                      className="flex-1 rounded-xl font-display gap-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0"
                    >
                      <PenLine className="h-4 w-4" /> {createEntry.isPending ? 'A guardar...' : 'Guardar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Entries Timeline */}
      <motion.div variants={item}>
        <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
          📖 Reflexões anteriores
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{entries.length} entradas</span>
        </h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">A carregar...</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                variants={item}
                whileHover={{ x: 4 }}
                className="group"
              >
                <Card className="border-border/50 hover:shadow-md transition-all duration-200 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex gap-3 p-4">
                      {/* Mood + timeline */}
                      <div className="flex flex-col items-center gap-1 pt-0.5">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.05, type: 'spring', stiffness: 400 }}
                          className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
                        >
                          {entry.mood}
                        </motion.div>
                        {i < entries.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border/50 rounded-full min-h-[20px]" />
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-display font-bold text-primary">{formatDate(entry.createdAt)}</span>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex gap-1">
                              {entry.tags.map((tag) => (
                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">{entry.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <Kivo page="diary" />
    </motion.div>
  );
}

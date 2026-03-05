import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Kivo } from '@/components/Kivo';
import { mockMissions } from '@/data/mock-data';
import { Target, CheckCircle2, Clock, Sparkles, Zap, Trophy } from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const statusConfig = {
  available: { label: 'Disponível', icon: Sparkles, bg: 'bg-[hsl(var(--kivara-light-green))]', badgeBg: 'bg-secondary text-secondary-foreground', color: 'text-secondary' },
  in_progress: { label: 'Em Progresso', icon: Clock, bg: 'bg-[hsl(var(--kivara-light-gold))]', badgeBg: 'bg-accent text-accent-foreground', color: 'text-accent-foreground' },
  completed: { label: 'Concluída', icon: CheckCircle2, bg: 'bg-[hsl(var(--kivara-light-blue))]', badgeBg: 'bg-primary text-primary-foreground', color: 'text-primary' },
};

const typeEmoji: Record<string, string> = { saving: '🏦', budgeting: '📊', planning: '📋' };

export default function ChildMissions() {
  const available = mockMissions.filter(m => m.status === 'available');
  const inProgress = mockMissions.filter(m => m.status === 'in_progress');
  const completed = mockMissions.filter(m => m.status === 'completed');
  const totalRewards = mockMissions.reduce((s, m) => s + m.reward, 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-2xl mx-auto pb-4">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 gradient-kivara" />
          <div className="absolute top-[-30%] right-[-15%] w-[55%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-white">Missões</h1>
                <p className="text-sm text-white/60">Aprende e ganha recompensas!</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Disponíveis', value: available.length, icon: Sparkles },
                { label: 'Em Curso', value: inProgress.length, icon: Zap },
                { label: 'Concluídas', value: completed.length, icon: Trophy },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                  <s.icon className="h-3.5 w-3.5 text-white/60 mx-auto mb-1" />
                  <p className="font-display font-bold text-white text-xl">{s.value}</p>
                  <p className="text-[9px] text-white/50 uppercase tracking-wider font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* In Progress Section */}
      {inProgress.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent-foreground" /> Em Curso
          </h2>
          <div className="space-y-3">
            {inProgress.map((mission) => {
              const cfg = statusConfig[mission.status];
              const progress = mission.targetAmount ? Math.min(Math.round(Math.random() * 80 + 10), 100) : 50;
              return (
                <Card key={mission.id} className="border-border/50 overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className="h-1 gradient-gold" />
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center text-2xl shrink-0`}>
                        {typeEmoji[mission.type]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-display font-bold text-sm">{mission.title}</h3>
                          <Badge className={`text-[9px] ${cfg.badgeBg} border-0 rounded-lg`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{mission.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-bold text-sm">🪙 {mission.reward}</p>
                        <p className="text-[10px] text-muted-foreground">+{mission.kivaPointsReward} pts</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[10px] text-muted-foreground font-medium">Progresso</span>
                        <span className="text-[10px] font-display font-bold text-accent-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 rounded-full" />
                    </div>
                    <Button size="sm" className="w-full mt-3 rounded-xl font-display bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5">
                      <Zap className="h-3.5 w-3.5" /> Continuar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Available Section */}
      {available.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-secondary" /> Disponíveis
          </h2>
          <div className="space-y-3">
            {available.map((mission) => {
              const cfg = statusConfig[mission.status];
              return (
                <motion.div key={mission.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Card className="border-border/50 overflow-hidden hover:shadow-md transition-all duration-200 group">
                    <div className="h-1 gradient-kivara" />
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                          {typeEmoji[mission.type]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-display font-bold text-sm">{mission.title}</h3>
                            <Badge className={`text-[9px] ${cfg.badgeBg} border-0 rounded-lg`}>{cfg.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{mission.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display font-bold text-sm">🪙 {mission.reward}</p>
                          <p className="text-[10px] text-muted-foreground">+{mission.kivaPointsReward} pts</p>
                        </div>
                      </div>
                      {mission.targetAmount && (
                        <div className="bg-muted/40 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                          <Target className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Meta: <strong className="text-foreground">🪙 {mission.targetAmount}</strong></span>
                        </div>
                      )}
                      <Button size="sm" className="w-full rounded-xl font-display gap-1.5 shadow-sm">
                        <Target className="h-3.5 w-3.5" /> Começar Missão
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Completed Section */}
      {completed.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Concluídas
          </h2>
          <div className="space-y-3">
            {completed.map((mission) => {
              const cfg = statusConfig[mission.status];
              return (
                <Card key={mission.id} className="border-border/50 opacity-80">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${cfg.bg} flex items-center justify-center text-xl shrink-0`}>
                      {typeEmoji[mission.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-sm">{mission.title}</h3>
                        <CheckCircle2 className="h-3.5 w-3.5 text-secondary shrink-0" />
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{mission.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-xs text-secondary">+{mission.reward} 🪙</p>
                      <p className="text-[10px] text-muted-foreground">+{mission.kivaPointsReward} pts</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      <Kivo page="missions" />
    </motion.div>
  );
}

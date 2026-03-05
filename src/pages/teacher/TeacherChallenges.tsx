import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockChallenges, mockClassrooms } from '@/data/mock-data';
import { Plus, Target, Trophy, Clock, Sparkles, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const statusConfig = {
  active: { label: 'Em Curso', icon: Target, className: 'bg-primary/10 text-primary border-primary/20' },
  upcoming: { label: 'Brevemente', icon: Clock, className: 'bg-accent/10 text-accent-foreground border-accent/20' },
  completed: { label: 'Concluído', icon: Trophy, className: 'bg-secondary/10 text-secondary border-secondary/20' },
};

const typeLabels: Record<string, string> = { saving: 'Poupança', budgeting: 'Orçamento', teamwork: 'Trabalho em Equipa' };

export default function TeacherChallenges() {
  const activeChallenges = mockChallenges.filter(c => c.status === 'active');
  const upcomingChallenges = mockChallenges.filter(c => c.status === 'upcoming');
  const completedChallenges = mockChallenges.filter(c => c.status === 'completed');

  const renderChallenge = (challenge: typeof mockChallenges[0], i: number) => {
    const classroom = mockClassrooms.find(c => c.id === challenge.classroomId);
    const pct = Math.round((challenge.currentAmount / challenge.targetAmount) * 100);
    const status = statusConfig[challenge.status];
    const StatusIcon = status.icon;

    return (
      <motion.div key={challenge.id} variants={item}>
        <Card className="border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring' as const, stiffness: 400 }}
                >
                  {challenge.icon}
                </motion.div>
                <div>
                  <h3 className="font-display font-bold text-base">{challenge.title}</h3>
                  <p className="text-[11px] text-muted-foreground">{classroom?.name} · {typeLabels[challenge.type]}</p>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] font-display font-semibold ${status.className}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{challenge.description}</p>

            {challenge.status !== 'upcoming' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progresso da turma</span>
                  <span className="font-display font-bold text-primary">{pct}%</span>
                </div>
                <Progress value={pct} className="h-3" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>🪙 {challenge.currentAmount} / {challenge.targetAmount}</span>
                  <span>{challenge.participants.length} participantes</span>
                </div>
              </div>
            )}

            {/* Participant contributions */}
            {challenge.participants.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-display font-semibold text-muted-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Contribuições
                </p>
                <div className="flex flex-wrap gap-2">
                  {challenge.participants.map((p) => (
                    <div key={p.childId} className="flex items-center gap-1.5 bg-muted/30 rounded-xl px-3 py-1.5 text-xs">
                      <span className="font-display font-bold">🪙 {p.contribution}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between pt-2 border-t border-border/30 text-xs text-muted-foreground gap-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-accent-foreground" /> +{challenge.reward} 🪙
                </span>
                <span>+{challenge.kivaPointsReward} pts</span>
              </div>
              <span className="text-[10px] sm:text-xs">{challenge.startDate} → {challenge.endDate}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="border-0 overflow-hidden relative shadow-kivara">
          <div className="absolute inset-0 bg-gradient-to-br from-accent via-primary to-secondary" />
          <div className="absolute top-[-30%] right-[-10%] w-[45%] h-[80%] rounded-full bg-white/5 blur-3xl" />
          <CardContent className="relative z-10 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wider">Educação Financeira</p>
                <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">Desafios Colectivos</h1>
                <p className="text-primary-foreground/60 text-sm">Cria desafios que envolvem toda a turma</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Activos</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">{activeChallenges.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Concluídos</p>
                  <p className="font-display text-xl font-bold text-primary-foreground">{completedChallenges.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Challenge */}
      <motion.div variants={item} className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Desafios
          </h2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl font-display gap-1">
              <Plus className="h-4 w-4" /> Novo Desafio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Criar Desafio Colectivo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input placeholder="Ex: Operação Mealheiro" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea placeholder="Descreve o objectivo do desafio..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Turma</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Escolhe" /></SelectTrigger>
                    <SelectContent>
                      {mockClassrooms.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Escolhe" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saving">Poupança</SelectItem>
                      <SelectItem value="budgeting">Orçamento</SelectItem>
                      <SelectItem value="teamwork">Equipa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Meta (KivaCoins)</Label>
                  <Input type="number" placeholder="1000" />
                </div>
                <div className="space-y-2">
                  <Label>Recompensa</Label>
                  <Input type="number" placeholder="50" />
                </div>
              </div>
              <Button className="w-full rounded-xl font-display"
                onClick={() => toast({ title: 'Desafio criado! 🎯', description: 'O novo desafio foi adicionado à turma.' })}
              >
                🏆 Criar Desafio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-xl h-10 sm:h-11">
          <TabsTrigger value="active" className="rounded-lg font-display text-[10px] sm:text-xs gap-1 sm:gap-1.5">
            <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Em Curso</span> ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-lg font-display text-[10px] sm:text-xs gap-1 sm:gap-1.5">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Brevemente</span> ({upcomingChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg font-display text-[10px] sm:text-xs gap-1 sm:gap-1.5">
            <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Concluídos</span> ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {activeChallenges.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum desafio em curso</p>}
          {activeChallenges.map(renderChallenge)}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {upcomingChallenges.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum desafio agendado</p>}
          {upcomingChallenges.map(renderChallenge)}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-4">
          {completedChallenges.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum desafio concluído</p>}
          {completedChallenges.map(renderChallenge)}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
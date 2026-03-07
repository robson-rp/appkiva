import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LESSON_CATEGORIES, DIFFICULTY_CONFIG, LessonCategory, MicroLesson } from '@/types/kivara';
import { LessonViewer } from '@/components/LessonViewer';
import { BookOpen, Clock, Star, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { useLessons } from '@/hooks/use-lessons';
import { useToast } from '@/hooks/use-toast';

export default function LearnPage() {
  const { data: lessons = [], isLoading } = useLessons();
  const [activeLesson, setActiveLesson] = useState<MicroLesson | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [earnedPoints, setEarnedPoints] = useState(0);
  const { toast } = useToast();

  const handleComplete = (score: number) => {
    if (!activeLesson) return;
    if (score >= 60) {
      setCompletedIds(prev => new Set(prev).add(activeLesson.id));
      setEarnedPoints(prev => prev + activeLesson.kivaPointsReward);
      toast({
        title: '🎉 Lição concluída!',
        description: `Ganhaste ${activeLesson.kivaPointsReward} KivaPoints!`,
      });
      setActiveLesson(null);
    } else {
      // retry — reset lesson
      setActiveLesson({ ...activeLesson });
    }
  };

  if (activeLesson) {
    return <LessonViewer lesson={activeLesson} onComplete={handleComplete} onBack={() => setActiveLesson(null)} />;
  }

  const categories = Object.entries(LESSON_CATEGORIES);
  const completedCount = completedIds.size;
  const totalPoints = mockLessons.filter(l => completedIds.has(l.id)).reduce((s, l) => s + l.kivaPointsReward, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Aprender
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Micro-lições de educação financeira</p>
      </motion.div>

      {/* Progress Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Progresso</p>
              <p className="text-lg font-display font-bold text-foreground">{completedCount}/{mockLessons.length} lições</p>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-display font-bold text-primary">{totalPoints} pts</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="all" className="text-xs rounded-lg">Todas</TabsTrigger>
          {categories.map(([key, cat]) => (
            <TabsTrigger key={key} value={key} className="text-xs rounded-lg gap-1">
              <span>{cat.icon}</span>
              <span className="hidden xs:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {mockLessons.map((lesson, i) => (
            <LessonCard key={lesson.id} lesson={lesson} index={i} completed={completedIds.has(lesson.id)} onStart={() => setActiveLesson(lesson)} />
          ))}
        </TabsContent>

        {categories.map(([key]) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-3">
            {mockLessons.filter(l => l.category === key).map((lesson, i) => (
              <LessonCard key={lesson.id} lesson={lesson} index={i} completed={completedIds.has(lesson.id)} onStart={() => setActiveLesson(lesson)} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function LessonCard({ lesson, index, completed, onStart }: { lesson: MicroLesson; index: number; completed: boolean; onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card
        className={`border-border/50 cursor-pointer transition-all hover:shadow-md active:scale-[0.99] ${completed ? 'opacity-80' : ''}`}
        onClick={onStart}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${completed ? 'bg-chart-3/15' : 'bg-primary/10'}`}>
            {completed ? <CheckCircle className="h-6 w-6 text-chart-3" /> : <span>{lesson.icon}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-foreground text-sm truncate">{lesson.title}</h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{lesson.description}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge className={`text-[9px] border-0 ${DIFFICULTY_CONFIG[lesson.difficulty].color}`}>
                {DIFFICULTY_CONFIG[lesson.difficulty].label}
              </Badge>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="h-3 w-3" /> {lesson.estimatedMinutes}min
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Star className="h-3 w-3" /> {lesson.kivaPointsReward}pts
              </span>
              <span className="text-[10px] text-muted-foreground">
                {lesson.quiz.length} perguntas
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

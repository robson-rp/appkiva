import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LESSON_CATEGORIES, DIFFICULTY_CONFIG, LessonCategory, MicroLesson } from '@/types/kivara';
import { LessonViewer } from '@/components/LessonViewer';
import { BookOpen, Clock, Star, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { useLessons } from '@/hooks/use-lessons';
import { useLessonProgress, useCompleteLessonMutation } from '@/hooks/use-lesson-progress';
import { useToast } from '@/hooks/use-toast';

import savingImg from '@/assets/lessons/saving.png';
import budgetingImg from '@/assets/lessons/budgeting.png';
import investingImg from '@/assets/lessons/investing.png';
import earningImg from '@/assets/lessons/earning.png';
import donatingImg from '@/assets/lessons/donating.png';

export default function LearnPage() {
  const { data: lessons = [], isLoading } = useLessons();
  const { completedIds, totalPoints, scoreMap, isLoading: progressLoading } = useLessonProgress();
  const completeLesson = useCompleteLessonMutation();
  const [activeLesson, setActiveLesson] = useState<MicroLesson | null>(null);
  const { toast } = useToast();

  const handleComplete = (score: number) => {
    if (!activeLesson) return;
    if (score >= 60) {
      completeLesson.mutate(
        { lessonId: activeLesson.id, score, kivaPoints: activeLesson.kivaPointsReward },
        {
          onSuccess: () => {
            toast({
              title: '🎉 Lição concluída!',
              description: `Ganhaste ${activeLesson.kivaPointsReward} KivaPoints!`,
            });
            setActiveLesson(null);
          },
        }
      );
    } else {
      // retry — reset lesson
      setActiveLesson({ ...activeLesson });
    }
  };

  if (activeLesson) {
    return <LessonViewer lesson={activeLesson} onComplete={handleComplete} onBack={() => setActiveLesson(null)} />;
  }

  if (isLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const categories = Object.entries(LESSON_CATEGORIES);
  const completedCount = completedIds.size;

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
              <p className="text-lg font-display font-bold text-foreground">{completedCount}/{lessons.length} lições</p>
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

        <TabsContent value="all" className="mt-4 grid grid-cols-2 gap-3">
          {lessons.map((lesson, i) => (
            <LessonCard key={lesson.id} lesson={lesson} index={i} completed={completedIds.has(lesson.id)} score={scoreMap.get(lesson.id) ?? 0} onStart={() => setActiveLesson(lesson)} />
          ))}
        </TabsContent>

        {categories.map(([key]) => (
          <TabsContent key={key} value={key} className="mt-4 grid grid-cols-2 gap-3">
            {lessons.filter(l => l.category === key).map((lesson, i) => (
              <LessonCard key={lesson.id} lesson={lesson} index={i} completed={completedIds.has(lesson.id)} score={scoreMap.get(lesson.id) ?? 0} onStart={() => setActiveLesson(lesson)} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  saving: 'from-emerald-500/80 to-emerald-700/80',
  budgeting: 'from-sky-500/80 to-blue-700/80',
  investing: 'from-violet-500/80 to-purple-700/80',
  earning: 'from-amber-400/80 to-yellow-600/80',
  donating: 'from-rose-400/80 to-pink-600/80',
};

const CATEGORY_IMAGES: Record<string, string> = {
  saving: savingImg,
  budgeting: budgetingImg,
  investing: investingImg,
  earning: earningImg,
  donating: donatingImg,
};

function LessonCard({ lesson, index, completed, score, onStart }: { lesson: MicroLesson; index: number; completed: boolean; score: number; onStart: () => void }) {
  const gradient = CATEGORY_GRADIENTS[lesson.category] || 'from-primary/60 to-primary/80';
  const categoryImage = CATEGORY_IMAGES[lesson.category];
  const quizTotal = lesson.quiz.length;
  const correctCount = completed ? Math.round((score / 100) * quizTotal) : 0;
  const pct = completed ? score : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`border-border/50 cursor-pointer overflow-hidden transition-shadow hover:shadow-lg ${completed ? 'opacity-75' : ''}`}
        onClick={onStart}
      >
        {/* Illustration area */}
        <div className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          {categoryImage ? (
            <img src={categoryImage} alt={lesson.category} className="h-24 w-24 object-contain drop-shadow-md" />
          ) : (
            <span className="text-5xl drop-shadow-md">{lesson.icon}</span>
          )}
          {completed && (
            <div className="absolute top-2 right-2 bg-background/90 rounded-full p-1">
              <CheckCircle className="h-5 w-5 text-chart-3" />
            </div>
          )}
          <Badge className={`absolute bottom-2 left-2 text-[9px] border-0 backdrop-blur-sm ${DIFFICULTY_CONFIG[lesson.difficulty].color}`}>
            {DIFFICULTY_CONFIG[lesson.difficulty].label}
          </Badge>
        </div>

        {/* Content */}
        <CardContent className="p-3">
          <h3 className="font-display font-bold text-foreground text-xs leading-tight line-clamp-2 min-h-[2rem]">
            {lesson.title}
          </h3>
          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1">{lesson.description}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" /> {lesson.estimatedMinutes}min
            </span>
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 text-chart-2" /> {lesson.kivaPointsReward}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-muted-foreground">
                {completed ? `${correctCount}/${quizTotal} corretas` : `0/${quizTotal} perguntas`}
              </span>
              <span className="text-[9px] font-semibold text-foreground">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${pct === 100 ? 'bg-chart-3' : pct > 0 ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: index * 0.03 + 0.2 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

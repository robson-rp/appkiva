import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LESSON_CATEGORIES, DIFFICULTY_CONFIG, LessonCategory, MicroLesson } from '@/types/kivara';
import { LessonViewer } from '@/components/LessonViewer';
import { LearningProgressMap } from '@/components/LearningProgressMap';
import { BookOpen, Clock, Star, CheckCircle, Sparkles, Loader2, ChevronLeft, ChevronRight, Map } from 'lucide-react';
import { useLessons } from '@/hooks/use-lessons';
import { useLessonProgress, useCompleteLessonMutation } from '@/hooks/use-lesson-progress';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useT } from '@/contexts/LanguageContext';

import savingImg from '@/assets/lessons/saving.png';
import budgetingImg from '@/assets/lessons/budgeting.png';
import investingImg from '@/assets/lessons/investing.png';
import earningImg from '@/assets/lessons/earning.png';
import donatingImg from '@/assets/lessons/donating.png';

const ITEMS_PER_PAGE = 6;

function PaginatedGrid({ lessons, completedIds, scoreMap, onStart }: {
  lessons: MicroLesson[];
  completedIds: Set<string>;
  scoreMap: Map<string, number>;
  onStart: (lesson: MicroLesson) => void;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(lessons.length / ITEMS_PER_PAGE));
  const paginated = lessons.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  useMemo(() => setPage(0), [lessons.length]);

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div key={page} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="grid grid-cols-2 gap-3">
          {paginated.map((lesson, i) => (
            <LessonCard key={lesson.id} lesson={lesson} index={i} completed={completedIds.has(lesson.id)} score={scoreMap.get(lesson.id) ?? 0} onStart={() => onStart(lesson)} />
          ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`h-2 rounded-full transition-all duration-200 ${i === page ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/25 hover:bg-muted-foreground/40'}`} />
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function LearnPage() {
  const t = useT();
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
            toast({ title: t('learn.completed_toast'), description: t('learn.completed_desc').replace('{points}', String(activeLesson.kivaPointsReward)) });
            setActiveLesson(null);
          },
        }
      );
    } else {
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
          <BookOpen className="h-6 w-6 text-primary" /> {t('learn.title')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t('learn.subtitle')}</p>
      </motion.div>

      {/* Progress Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('learn.progress')}</p>
              <p className="text-lg font-display font-bold text-foreground">{t('learn.lessons_count').replace('{completed}', String(completedCount)).replace('{done}', String(completedCount)).replace('{total}', String(lessons.length))}</p>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-display font-bold text-primary">{totalPoints} pts</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Tabs */}
      <Tabs defaultValue="map">
        <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="map" className="text-xs rounded-lg gap-1">
            <Map className="h-3 w-3" />
            <span>{t('learn.map')}</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs rounded-lg">{t('learn.all')}</TabsTrigger>
          {categories.map(([key, cat]) => (
            <TabsTrigger key={key} value={key} className="text-xs rounded-lg gap-1">
              <span>{cat.icon}</span>
              <span className="hidden xs:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="map" className="mt-4">
          <LearningProgressMap lessons={lessons} completedIds={completedIds} onStartLesson={setActiveLesson} />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <PaginatedGrid lessons={lessons} completedIds={completedIds} scoreMap={scoreMap} onStart={setActiveLesson} />
        </TabsContent>

        {categories.map(([key]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <PaginatedGrid lessons={lessons.filter(l => l.category === key)} completedIds={completedIds} scoreMap={scoreMap} onStart={setActiveLesson} />
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
  const t = useT();
  const gradient = CATEGORY_GRADIENTS[lesson.category] || 'from-primary/60 to-primary/80';
  const categoryImage = CATEGORY_IMAGES[lesson.category];
  const quizTotal = lesson.quiz.length;
  const correctCount = completed ? Math.round((score / 100) * quizTotal) : 0;
  const pct = completed ? score : 0;
  const hasAudio = lesson.blocks.some(b => b.type === 'audio');
  const hasVideo = lesson.blocks.some(b => b.type === 'video');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className={`border-border/50 cursor-pointer overflow-hidden transition-shadow hover:shadow-lg ${completed ? 'opacity-75' : ''}`} onClick={onStart}>
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
          {(hasAudio || hasVideo) && (
            <div className="absolute top-2 left-2 flex gap-1">
              {hasAudio && <span className="bg-background/80 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[10px]">🎧</span>}
              {hasVideo && <span className="bg-background/80 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[10px]">🎬</span>}
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <h3 className="font-display font-bold text-foreground text-xs leading-tight line-clamp-2 min-h-[2rem]">{lesson.title}</h3>
          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1">{lesson.description}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {lesson.estimatedMinutes}min</span>
            <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-chart-2" /> {lesson.kivaPointsReward}</span>
          </div>

          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-muted-foreground">
                {completed
                  ? t('learn.correct_count').replace('{correct}', String(correctCount)).replace('{total}', String(quizTotal))
                  : t('learn.questions_count').replace('{total}', String(quizTotal))}
              </span>
              <span className="text-[9px] font-semibold text-foreground">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div className={`h-full rounded-full ${pct === 100 ? 'bg-chart-3' : pct > 0 ? 'bg-primary' : 'bg-muted-foreground/20'}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: index * 0.03 + 0.2 }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

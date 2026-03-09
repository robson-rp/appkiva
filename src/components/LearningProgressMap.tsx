import { motion } from 'framer-motion';
import { LESSON_CATEGORIES, LessonCategory, MicroLesson } from '@/types/kivara';
import { Lock, CheckCircle, Star } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';

interface LearningProgressMapProps {
  lessons: MicroLesson[];
  completedIds: Set<string>;
  onStartLesson: (lesson: MicroLesson) => void;
}

const WORLD_ORDER: LessonCategory[] = ['earning', 'saving', 'budgeting', 'investing', 'donating'];

const WORLD_GRADIENTS: Record<LessonCategory, string> = {
  earning: 'from-amber-400/20 to-yellow-600/20',
  saving: 'from-emerald-400/20 to-green-600/20',
  budgeting: 'from-sky-400/20 to-blue-600/20',
  investing: 'from-violet-400/20 to-purple-600/20',
  donating: 'from-rose-400/20 to-pink-600/20',
};

const WORLD_COLORS: Record<LessonCategory, string> = {
  earning: 'border-amber-400/50',
  saving: 'border-emerald-400/50',
  budgeting: 'border-sky-400/50',
  investing: 'border-violet-400/50',
  donating: 'border-rose-400/50',
};

const WORLD_ACTIVE_BG: Record<LessonCategory, string> = {
  earning: 'bg-amber-500/10',
  saving: 'bg-emerald-500/10',
  budgeting: 'bg-sky-500/10',
  investing: 'bg-violet-500/10',
  donating: 'bg-rose-500/10',
};

export function LearningProgressMap({ lessons, completedIds, onStartLesson }: LearningProgressMapProps) {
  const t = useT();

  // Group lessons by category
  const worldLessons = WORLD_ORDER.map(cat => ({
    category: cat,
    config: LESSON_CATEGORIES[cat],
    lessons: lessons.filter(l => l.category === cat),
  }));

  // Calculate which worlds are unlocked (a world unlocks when previous world has at least 1 completed)
  const isWorldUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    const prevWorld = worldLessons[index - 1];
    return prevWorld.lessons.some(l => completedIds.has(l.id));
  };

  return (
    <div className="relative pb-4">
      {/* Connecting path */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border/50 -translate-x-1/2 z-0" />

      <div className="relative z-10 space-y-6">
        {worldLessons.map((world, worldIndex) => {
          const unlocked = isWorldUnlocked(worldIndex);
          const completedCount = world.lessons.filter(l => completedIds.has(l.id)).length;
          const totalCount = world.lessons.length;
          const allDone = totalCount > 0 && completedCount === totalCount;

          return (
            <motion.div
              key={world.category}
              initial={{ opacity: 0, x: worldIndex % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: worldIndex * 0.1 }}
              className={`relative ${!unlocked ? 'opacity-40' : ''}`}
            >
              {/* World header */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${WORLD_COLORS[world.category]} bg-gradient-to-r ${WORLD_GRADIENTS[world.category]} backdrop-blur-sm`}>
                <div className={`w-12 h-12 rounded-2xl ${WORLD_ACTIVE_BG[world.category]} flex items-center justify-center text-2xl shrink-0`}>
                  {allDone ? '⭐' : world.config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-sm text-foreground">{world.config.label}</h3>
                    {!unlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                    {allDone && <CheckCircle className="h-3.5 w-3.5 text-secondary" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t('learn.lessons_count').replace('{done}', String(completedCount)).replace('{total}', String(totalCount))}</p>
                </div>
                {/* Mini progress */}
                <div className="w-12 h-12 relative shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <motion.circle
                      cx="18" cy="18" r="15" fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(completedCount / Math.max(totalCount, 1)) * 94.2} 94.2`}
                      initial={{ strokeDasharray: '0 94.2' }}
                      animate={{ strokeDasharray: `${(completedCount / Math.max(totalCount, 1)) * 94.2} 94.2` }}
                      transition={{ duration: 0.8, delay: worldIndex * 0.1 }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-display font-bold text-foreground">
                    {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                  </span>
                </div>
              </div>

              {/* Lesson nodes */}
              {unlocked && world.lessons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 pl-4">
                  {world.lessons.map((lesson, lessonIndex) => {
                    const completed = completedIds.has(lesson.id);
                    // A lesson is available if previous lesson in same world is completed or it's the first
                    const isAvailable = lessonIndex === 0 || completedIds.has(world.lessons[lessonIndex - 1].id);

                    return (
                      <motion.button
                        key={lesson.id}
                        whileHover={isAvailable ? { scale: 1.05 } : {}}
                        whileTap={isAvailable ? { scale: 0.95 } : {}}
                        onClick={() => isAvailable && onStartLesson(lesson)}
                        disabled={!isAvailable}
                        className={`
                          relative w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all
                          ${completed
                            ? 'bg-secondary/15 border-2 border-secondary/30 shadow-sm shadow-secondary/20'
                            : isAvailable
                              ? `${WORLD_ACTIVE_BG[world.category]} border-2 ${WORLD_COLORS[world.category]} cursor-pointer hover:shadow-md`
                              : 'bg-muted/50 border border-border/30 cursor-not-allowed opacity-50'
                          }
                        `}
                      >
                        {completed ? (
                          <Star className="h-4 w-4 text-secondary fill-secondary" />
                        ) : isAvailable ? (
                          <span className="text-sm">{lesson.icon}</span>
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                        )}
                        {completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-secondary flex items-center justify-center"
                          >
                            <CheckCircle className="h-3 w-3 text-secondary-foreground" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

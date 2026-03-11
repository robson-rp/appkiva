import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Coins, PiggyBank, ShoppingCart, HandCoins, Target,
  ChevronRight, Clock, CheckCircle2, Sparkles, ArrowRight,
  BookOpen, Users, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

/* ─── types ─── */
type Phase = "intro" | "quiz" | "result";
type Tier = "beginner" | "developing" | "strong";

interface Question {
  icon: React.ElementType;
  key: string;
  options: string[]; // i18n keys for 3 options (score 1, 2, 3)
}

/* ─── data ─── */
const QUESTIONS: Question[] = [
  { icon: Coins, key: "quiz.q1", options: ["quiz.q1.a", "quiz.q1.b", "quiz.q1.c"] },
  { icon: PiggyBank, key: "quiz.q2", options: ["quiz.q2.a", "quiz.q2.b", "quiz.q2.c"] },
  { icon: ShoppingCart, key: "quiz.q3", options: ["quiz.q3.a", "quiz.q3.b", "quiz.q3.c"] },
  { icon: HandCoins, key: "quiz.q4", options: ["quiz.q4.a", "quiz.q4.b", "quiz.q4.c"] },
  { icon: Target, key: "quiz.q5", options: ["quiz.q5.a", "quiz.q5.b", "quiz.q5.c"] },
];

function getTier(score: number): Tier {
  if (score <= 7) return "beginner";
  if (score <= 11) return "developing";
  return "strong";
}

const TIER_COLORS: Record<Tier, string> = {
  beginner: "text-orange-500",
  developing: "text-amber-500",
  strong: "text-emerald-500",
};

const TIER_BG: Record<Tier, string> = {
  beginner: "bg-orange-500/10 border-orange-500/20",
  developing: "bg-amber-500/10 border-amber-500/20",
  strong: "bg-emerald-500/10 border-emerald-500/20",
};

/* ─── animation ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function FinancialHabitsQuiz() {
  const t = useT();
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [direction, setDirection] = useState(1);

  const totalScore = answers.reduce((s, a) => s + a, 0);
  const tier = getTier(totalScore);

  const handleStart = useCallback(() => {
    setPhase("quiz");
    setCurrentQ(0);
    setAnswers([]);
    setDirection(1);
  }, []);

  const handleAnswer = useCallback((score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);
    setDirection(1);

    if (currentQ + 1 >= QUESTIONS.length) {
      setTimeout(() => setPhase("result"), 350);
    } else {
      setTimeout(() => setCurrentQ(currentQ + 1), 200);
    }
  }, [answers, currentQ]);

  const handleRestart = useCallback(() => {
    setPhase("intro");
    setCurrentQ(0);
    setAnswers([]);
  }, []);

  const q = QUESTIONS[currentQ];
  const progress = phase === "quiz" ? ((currentQ) / QUESTIONS.length) * 100 : 0;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
    >
      <div className="mx-auto max-w-2xl">
        <AnimatePresence mode="wait">
          {/* ─── INTRO ─── */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
                <Clock className="w-4 h-4" />
                {t("quiz.time")}
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-[1.1]"
              >
                {t("quiz.title")}
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10 text-balance"
              >
                {t("quiz.subtitle")}
              </motion.p>

              <motion.div variants={fadeUp}>
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="text-base px-8 transition-shadow hover:shadow-lg hover:shadow-primary/20"
                >
                  {t("quiz.start")} <ArrowRight className="ml-1 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ─── QUIZ ─── */}
          {phase === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress */}
              <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>{t("quiz.question")} {currentQ + 1}/{QUESTIONS.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 mb-8" />

              {/* Question Card */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentQ}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <q.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg md:text-xl font-bold leading-snug">
                      {t(q.key)}
                    </h3>
                  </div>

                  <div className="grid gap-3">
                    {q.options.map((optKey, i) => {
                      const score = i + 1;
                      return (
                        <button
                          key={optKey}
                          onClick={() => handleAnswer(score)}
                          className={cn(
                            "w-full text-left rounded-xl border-2 border-border/60 bg-muted/30 p-4 md:p-5",
                            "font-medium text-foreground text-base",
                            "transition-all duration-200",
                            "hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm",
                            "active:scale-[0.98] active:bg-primary/10",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          )}
                        >
                          {t(optKey)}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ─── RESULT ─── */}
          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            >
              {/* Score Card */}
              <div className={cn("rounded-2xl border-2 p-6 md:p-8 text-center mb-6", TIER_BG[tier])}>
                <div className="flex justify-center mb-4">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", TIER_BG[tier])}>
                    <Sparkles className={cn("w-8 h-8", TIER_COLORS[tier])} />
                  </div>
                </div>

                <div className={cn("font-display text-4xl md:text-5xl font-bold mb-2", TIER_COLORS[tier])}>
                  {totalScore}/15
                </div>

                <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">
                  {t(`quiz.result.${tier}.title`)}
                </h3>

                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md mx-auto">
                  {t(`quiz.result.${tier}.message`)}
                </p>
              </div>

              {/* Recommendation */}
              <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 md:p-8 mb-6">
                <h4 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  {t("quiz.recommend.title")}
                </h4>

                <ul className="space-y-3">
                  {[
                    { icon: BookOpen, key: "quiz.recommend.1" },
                    { icon: PiggyBank, key: "quiz.recommend.2" },
                    { icon: Users, key: "quiz.recommend.3" },
                  ].map(({ icon: Icon, key }) => (
                    <li key={key} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground text-base">{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="text-center space-y-4">
                <p className="font-display text-xl md:text-2xl font-bold">
                  {t("quiz.cta.title")}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    size="lg"
                    className="text-base px-8 transition-shadow hover:shadow-lg hover:shadow-primary/20"
                    asChild
                  >
                    <Link to="/login">
                      {t("quiz.cta.button")} <ChevronRight className="ml-1" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleRestart}
                    className="text-base"
                  >
                    {t("quiz.cta.restart")}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

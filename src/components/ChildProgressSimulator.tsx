import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Coins, Target, TrendingUp, Trophy, Wallet, BarChart3,
  ListChecks, Banknote, Smartphone, Brain, ChevronRight,
  Sparkles, Clock, Rocket, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { useT } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

/* ─── types ─── */
type Band = "habits" | "responsibility" | "independence";

interface Milestone {
  icon: React.ElementType;
  labelKey: string;
}

/* ─── data ─── */
const BANDS: Record<Band, { titleKey: string; milestones: Milestone[] }> = {
  habits: {
    titleKey: "sim.band.habits",
    milestones: [
      { icon: Coins, labelKey: "sim.m.save" },
      { icon: Target, labelKey: "sim.m.missions" },
      { icon: TrendingUp, labelKey: "sim.m.goals" },
      { icon: Trophy, labelKey: "sim.m.rewards" },
    ],
  },
  responsibility: {
    titleKey: "sim.band.responsibility",
    milestones: [
      { icon: Wallet, labelKey: "sim.m.allowance" },
      { icon: BarChart3, labelKey: "sim.m.spending" },
      { icon: ListChecks, labelKey: "sim.m.discipline" },
    ],
  },
  independence: {
    titleKey: "sim.band.independence",
    milestones: [
      { icon: Banknote, labelKey: "sim.m.real_money" },
      { icon: Smartphone, labelKey: "sim.m.digital_wallet" },
      { icon: Brain, labelKey: "sim.m.decisions" },
    ],
  },
};

const TIMELINE = [
  { labelKey: "sim.tl.today", icon: Star },
  { labelKey: "sim.tl.1year", icon: Clock },
  { labelKey: "sim.tl.3years", icon: Sparkles },
  { labelKey: "sim.tl.future", icon: Rocket },
];

function getBand(age: number): Band {
  if (age <= 10) return "habits";
  if (age <= 14) return "responsibility";
  return "independence";
}

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function ChildProgressSimulator() {
  const t = useT();
  const [age, setAge] = useState(8);
  const band = getBand(age);
  const bandData = BANDS[band];

  const handleAgeChange = useCallback((value: number[]) => {
    setAge(value[0]);
  }, []);

  const message = t(`sim.message.${band}`).replace("{age}", String(age));

  return (
    <motion.section
      id="simulador"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="px-5 sm:px-8 lg:px-12 py-16 md:py-24"
    >
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.h2
          variants={fadeUp}
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-balance leading-[1.1]"
        >
          {t("sim.title")}
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-muted-foreground text-lg md:text-xl text-center max-w-3xl mx-auto mb-12 text-balance"
        >
          {t("sim.subtitle")}
        </motion.p>

        {/* Age Slider Card */}
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 md:p-8 mb-8"
        >
          <label className="block text-center font-display text-lg font-semibold mb-6">
            {t("sim.age_question")}
          </label>

          <div className="flex items-center justify-center mb-4">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={age}
                initial={{ opacity: 0, y: -12, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.8 }}
                transition={{ duration: 0.25 }}
                className="font-display text-5xl md:text-6xl font-bold text-primary"
              >
                {age}
              </motion.span>
            </AnimatePresence>
            <span className="text-muted-foreground text-xl ml-2 font-body">{t("sim.years")}</span>
          </div>

          {/* Large touch-friendly slider */}
          <SliderPrimitive.Root
            min={5}
            max={17}
            step={1}
            value={[age]}
            onValueChange={handleAgeChange}
            className="relative flex w-full touch-none select-none items-center py-2"
          >
            <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-secondary">
              <SliderPrimitive.Range className="absolute h-full bg-primary transition-all" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="block h-7 w-7 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-lg cursor-grab active:cursor-grabbing" />
          </SliderPrimitive.Root>

          <div className="flex justify-between text-caption text-muted-foreground mt-1 px-1">
            <span>5</span>
            <span>10</span>
            <span>17</span>
          </div>
        </motion.div>

        {/* Age Band Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={band}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 md:p-8 mb-8"
          >
            <h3 className="font-display text-xl md:text-2xl font-bold text-center mb-6">
              <span className="text-primary">{t(bandData.titleKey)}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {bandData.milestones.map((m, i) => (
                <motion.div
                  key={m.labelKey}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-muted/50 border border-border/50"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <m.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground leading-tight">
                    {t(m.labelKey)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Timeline */}
        <motion.div variants={fadeUp} className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 md:p-8 mb-8">
          <div className="relative flex justify-between items-start">
            {/* Connecting line */}
            <div className="absolute top-5 left-[10%] right-[10%] h-[3px] bg-muted rounded-full" />
            <motion.div
              className="absolute top-5 left-[10%] h-[3px] bg-primary rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: "80%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />

            {TIMELINE.map((point, i) => (
              <motion.div
                key={point.labelKey}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
                className="flex flex-col items-center text-center relative z-10 flex-1"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    "bg-primary border-primary text-primary-foreground"
                  )}
                >
                  <point.icon className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground mt-2">
                  {t(point.labelKey)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`msg-${band}-${age}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 md:p-6 text-center mb-8"
          >
            <p className="text-base md:text-lg font-medium text-foreground leading-relaxed">
              "{message}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div variants={fadeUp} className="text-center">
          <p className="font-display text-xl md:text-2xl font-bold mb-4">
            {t("sim.cta.title")}
          </p>
          <Button
            size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base px-8 transition-shadow hover:shadow-lg hover:shadow-secondary/20"
            asChild
          >
            <Link to="/login">
              {t("sim.cta.button")} <ChevronRight className="ml-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}

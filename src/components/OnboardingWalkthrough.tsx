import { useState, useCallback } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { SplashIllustration } from '@/components/SplashIllustration';

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export function OnboardingWalkthrough() {
  const { showOnboarding, currentStep, totalSteps, steps, nextStep, prevStep, skipWalkthrough } = useOnboarding();
  const [direction, setDirection] = useState(1);

  const handleNext = useCallback(() => {
    setDirection(1);
    nextStep();
  }, [nextStep]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    prevStep();
  }, [prevStep]);

  const step = steps[currentStep];
  if (!showOnboarding || steps.length === 0 || !step) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg mx-4 bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          const swipe = info.offset.x;
          const velocity = info.velocity.x;
          if (swipe < -50 || velocity < -300) {
            handleNext();
          } else if ((swipe > 50 || velocity > 300) && currentStep > 0) {
            handlePrev();
          }
        }}
      >

        {/* Illustration area */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <SplashIllustration illustrationKey={step.illustrationKey} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2">
                {step.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-5 mb-5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-6 bg-primary'
                    : i < currentStep
                    ? 'w-1.5 bg-primary/40'
                    : 'w-1.5 bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={skipWalkthrough}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Saltar
            </button>
            <Button
              onClick={handleNext}
              className="rounded-xl px-6 gap-2 font-display font-semibold shadow-md shadow-primary/20"
            >
              {isFirst && step.cta ? step.cta : isLast ? 'Começar a usar' : 'Seguinte'}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Button to re-trigger the walkthrough from help menus */
export function RestartOnboardingButton() {
  const { resetWalkthrough } = useOnboarding();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={resetWalkthrough}
      className="gap-1.5 text-muted-foreground hover:text-foreground rounded-xl text-xs"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      Rever tutorial
    </Button>
  );
}

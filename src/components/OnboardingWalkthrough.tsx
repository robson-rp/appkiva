import { useOnboarding } from '@/hooks/use-onboarding';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, RotateCcw } from 'lucide-react';
import kivoSvg from '@/assets/kivo.svg';

export function OnboardingWalkthrough() {
  const { showOnboarding, currentStep, totalSteps, steps, nextStep, skipWalkthrough } = useOnboarding();

  if (!showOnboarding || steps.length === 0) return null;

  const step = steps[currentStep];
  if (!step) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={skipWalkthrough} />

        {/* Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md bg-card/95 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-chart-3 to-chart-4" />

          {/* Skip button */}
          <button
            onClick={skipWalkthrough}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all z-10"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-6 pt-5">
            {/* Mascot or Icon */}
            <div className="flex justify-center mb-4">
              {step.showMascot ? (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="relative"
                >
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-chart-3/20 flex items-center justify-center shadow-lg shadow-primary/10">
                    <img src={kivoSvg} alt="Kivo" className="w-14 h-14" />
                  </div>
                  <motion.div
                    className="absolute -bottom-1 -right-1 text-2xl"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    👋
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-chart-4/15 flex items-center justify-center text-3xl shadow-md"
                >
                  {step.icon}
                </motion.div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-display font-bold text-foreground text-center mb-2">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-muted-foreground text-center leading-relaxed mb-3">
              {step.description}
            </p>

            {/* Bullets */}
            {step.bullets && (
              <motion.ul
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-1.5 mb-4 px-4"
              >
                {step.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </motion.ul>
            )}

            {/* Step indicator dots */}
            <div className="flex justify-center gap-1.5 mb-5">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? 'w-6 bg-primary'
                      : i < currentStep
                      ? 'w-1.5 bg-primary/40'
                      : 'w-1.5 bg-muted-foreground/20'
                  }`}
                  layoutId={`dot-${i}`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={skipWalkthrough}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
              >
                Saltar
              </button>
              <Button
                onClick={nextStep}
                className="rounded-xl px-6 gap-2 font-display font-semibold shadow-md shadow-primary/20"
              >
                {isFirst ? 'Começar tour' : isLast ? 'Concluir' : 'Seguinte'}
                {!isLast && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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

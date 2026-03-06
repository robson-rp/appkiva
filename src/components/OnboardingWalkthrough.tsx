import { useEffect, useState, useCallback } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, RotateCcw } from 'lucide-react';
import kivoSvg from '@/assets/kivo.svg';

function useHighlightRect(selector?: string, step?: number) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!selector) { setRect(null); return; }

    // Small delay to let dashboard render
    const timer = setTimeout(() => {
      const el = document.querySelector(selector);
      if (el) {
        setRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        setRect(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [selector, step]);

  return rect;
}

export function OnboardingWalkthrough() {
  const { showOnboarding, currentStep, totalSteps, steps, nextStep, skipWalkthrough } = useOnboarding();

  const step = steps[currentStep];
  const rect = useHighlightRect(step?.highlightSelector, currentStep);

  if (!showOnboarding || steps.length === 0 || !step) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const hasHighlight = !!rect;
  const pad = 8;

  // Build clip-path to create spotlight cutout
  const clipPath = hasHighlight
    ? `polygon(
        0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
        ${rect.left - pad}px ${rect.top - pad}px,
        ${rect.left - pad}px ${rect.bottom + pad}px,
        ${rect.right + pad}px ${rect.bottom + pad}px,
        ${rect.right + pad}px ${rect.top - pad}px,
        ${rect.left - pad}px ${rect.top - pad}px
      )`
    : undefined;

  // Position card near highlight or center
  const cardStyle: React.CSSProperties = {};
  if (hasHighlight) {
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow > 320) {
      cardStyle.position = 'absolute';
      cardStyle.top = rect.bottom + pad + 16;
      cardStyle.left = '50%';
      cardStyle.transform = 'translateX(-50%)';
    } else if (spaceAbove > 320) {
      cardStyle.position = 'absolute';
      cardStyle.bottom = window.innerHeight - rect.top + pad + 16;
      cardStyle.left = '50%';
      cardStyle.transform = 'translateX(-50%)';
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop with optional spotlight cutout */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500"
          style={clipPath ? { clipPath } : undefined}
          onClick={skipWalkthrough}
        />

        {/* Highlight ring around target element */}
        {hasHighlight && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute pointer-events-none rounded-2xl border-2 border-primary shadow-[0_0_24px_4px_hsl(var(--primary)/0.3)]"
            style={{
              top: rect.top - pad,
              left: rect.left - pad,
              width: rect.width + pad * 2,
              height: rect.height + pad * 2,
            }}
          />
        )}

        {/* Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md bg-card/95 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden"
          style={cardStyle}
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

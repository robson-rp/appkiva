import { useReducedMotion } from 'framer-motion';

/**
 * Returns framer-motion transition props that respect prefers-reduced-motion.
 * Usage: <motion.div {...motionSafe({ duration: 0.25 })} />
 */
export function useMotionSafe() {
  const prefersReduced = useReducedMotion();

  return {
    /** Wraps initial/animate/exit so they become no-ops when reduced motion is on */
    shouldAnimate: !prefersReduced,
    /** Returns transition with instant timing when reduced motion is preferred */
    safeTransition: (transition: Record<string, unknown>) =>
      prefersReduced ? { duration: 0 } : transition,
  };
}

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { playXPGainSound } from '@/lib/celebration-effects';
import { Zap } from 'lucide-react';

interface XPGainToastProps {
  amount: number;
  onComplete: () => void;
}

export function XPGainToast({ amount, onComplete }: XPGainToastProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    playXPGainSound();
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 400);
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: [0, 1, 1, 0], y: [20, -10, -30, -60], scale: [0.8, 1.1, 1, 0.9] }}
      transition={{ duration: 2, ease: 'easeOut' }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
    >
      <div className="flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm text-primary-foreground rounded-full px-4 py-2 shadow-lg">
        <Zap className="h-4 w-4" />
        <span className="font-display font-bold text-sm">+{amount} FXP</span>
      </div>
    </motion.div>
  );
}

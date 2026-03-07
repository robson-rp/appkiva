import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { playCoinSound } from '@/lib/celebration-effects';

interface CoinFlyAnimationProps {
  amount?: number;
  onComplete: () => void;
}

const COIN_COUNT = 8;

export function CoinFlyAnimation({ amount = 0, onComplete }: CoinFlyAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    playCoinSound();
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 300);
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate random starting positions (center-ish of screen)
  const coins = Array.from({ length: COIN_COUNT }, (_, i) => ({
    id: i,
    startX: 40 + Math.random() * 20, // 40-60% of viewport width
    startY: 40 + Math.random() * 20, // 40-60% of viewport height
    delay: i * 0.06,
  }));

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          {coins.map((coin) => (
            <motion.div
              key={coin.id}
              initial={{
                x: `${coin.startX}vw`,
                y: `${coin.startY}vh`,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: '85vw',
                y: '8vh',
                scale: [0, 1.3, 0.8],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 0.9,
                delay: coin.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute text-2xl"
            >
              🪙
            </motion.div>
          ))}

          {/* Amount label */}
          {amount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: '45vh', x: '40vw' }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.8], y: '35vh' }}
              transition={{ duration: 1.2 }}
              className="absolute font-display font-bold text-xl text-accent-foreground bg-accent/20 backdrop-blur-sm rounded-full px-4 py-2"
            >
              +{amount} 🪙
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}

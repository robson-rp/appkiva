import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CollectibleBadge, BADGE_TIERS, BADGE_CATEGORIES } from '@/types/kivara';
import { Sparkles } from 'lucide-react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  delay: number;
  duration: number;
  shape: 'circle' | 'square' | 'star';
}

const CONFETTI_COLORS = [
  'hsl(39, 89%, 57%)',
  'hsl(214, 64%, 45%)',
  'hsl(160, 54%, 40%)',
  'hsl(340, 60%, 60%)',
  'hsl(270, 50%, 60%)',
  'hsl(20, 90%, 55%)',
  'hsl(50, 95%, 60%)',
  'hsl(180, 60%, 50%)',
];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    size: 6 + Math.random() * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 1.5,
    shape: (['circle', 'square', 'star'] as const)[Math.floor(Math.random() * 3)],
  }));
}

interface BadgeUnlockCeremonyProps {
  badge: CollectibleBadge;
  onComplete: () => void;
}

export function BadgeUnlockCeremony({ badge, onComplete }: BadgeUnlockCeremonyProps) {
  const [phase, setPhase] = useState<'burst' | 'reveal' | 'done'>('burst');
  const [confetti] = useState(() => generateConfetti(40));
  const tierConfig = BADGE_TIERS[badge.tier];
  const catConfig = BADGE_CATEGORIES[badge.category];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('reveal'), 600),
      setTimeout(() => setPhase('done'), 3200),
      setTimeout(() => onComplete(), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
          onClick={onComplete}
        >
          <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

          {/* Confetti */}
          {confetti.map((c) => (
            <motion.div
              key={c.id}
              initial={{ x: `${c.x}vw`, y: '-5vh', rotate: 0, opacity: 1 }}
              animate={{
                y: '110vh',
                rotate: c.rotation + 720,
                opacity: [1, 1, 0.8, 0],
              }}
              transition={{ duration: c.duration, delay: c.delay, ease: 'easeIn' }}
              className="absolute z-[61]"
              style={{
                width: c.size,
                height: c.shape === 'circle' ? c.size : c.size * 1.4,
                backgroundColor: c.shape !== 'star' ? c.color : 'transparent',
                borderRadius: c.shape === 'circle' ? '50%' : c.shape === 'square' ? '2px' : 0,
                ...(c.shape === 'star' ? { fontSize: c.size, lineHeight: 1 } : {}),
              }}
            >
              {c.shape === 'star' && '✦'}
            </motion.div>
          ))}

          <div className="relative z-[62] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* Radial burst */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2.5, 3], opacity: [0, 0.6, 0] }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute w-32 h-32 rounded-full"
              style={{ background: `radial-gradient(circle, hsl(var(--accent) / 0.5), transparent 70%)` }}
            />

            {/* Sparkle ring */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (360 / 8) * i;
              const rad = (angle * Math.PI) / 180;
              return (
                <motion.div
                  key={`ring-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    x: Math.cos(rad) * 90,
                    y: Math.sin(rad) * 90,
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                  className="absolute text-lg"
                >
                  ✨
                </motion.div>
              );
            })}

            {/* Badge icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: phase === 'reveal' ? [0, 1.4, 1] : [0, 1.2],
                rotate: 0,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                animate={{ boxShadow: ['0 0 0px transparent', '0 0 40px hsl(var(--accent) / 0.5)', '0 0 20px hsl(var(--accent) / 0.3)'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                className="w-28 h-28 rounded-3xl flex items-center justify-center bg-card border-2 border-accent/30"
              >
                <span className="text-6xl">{badge.icon}</span>
              </motion.div>
            </motion.div>

            {/* Text */}
            <AnimatePresence>
              {phase === 'reveal' && (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                  className="mt-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: [0.5, 1.15, 1] }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 justify-center mb-2"
                  >
                    <Sparkles className="h-5 w-5 text-accent" />
                    <span className="font-display text-sm font-bold uppercase tracking-widest text-accent">
                      Badge Desbloqueado!
                    </span>
                    <Sparkles className="h-5 w-5 text-accent" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-2xl font-display font-bold text-foreground"
                  >
                    {badge.name}
                  </motion.h2>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-center justify-center gap-2 mt-3"
                  >
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tierConfig.bg} ${tierConfig.color}`}>
                      {tierConfig.label}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      {catConfig.icon} {catConfig.label}
                    </span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-sm text-muted-foreground mt-3 max-w-[250px]"
                  >
                    {badge.description}
                  </motion.p>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onComplete}
                    className="mt-5 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm"
                  >
                    Incrível! 🎉
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

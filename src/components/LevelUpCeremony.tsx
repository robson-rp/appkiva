import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Level, LEVEL_CONFIG } from '@/types/kivara';
import { useT } from '@/contexts/LanguageContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  angle: number;
}

interface LevelUpCeremonyProps {
  fromLevel: Level;
  toLevel: Level;
  onComplete?: () => void;
}

const PARTICLE_COLORS = [
  'hsl(39, 89%, 57%)',   // gold
  'hsl(214, 64%, 45%)',  // blue
  'hsl(160, 54%, 40%)',  // green
  'hsl(340, 60%, 60%)',  // pink
  'hsl(270, 50%, 60%)',  // purple
  'hsl(39, 89%, 70%)',   // light gold
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 10,
    y: 50 + (Math.random() - 0.5) * 10,
    size: Math.random() * 8 + 4,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    delay: Math.random() * 0.4,
    duration: 0.8 + Math.random() * 0.6,
    angle: (360 / count) * i + Math.random() * 20,
  }));
}

export function LevelUpCeremony({ fromLevel, toLevel, onComplete }: LevelUpCeremonyProps) {
  const t = useT();
  const [phase, setPhase] = useState<'enter' | 'transform' | 'reveal' | 'done'>('enter');
  const [particles] = useState(() => generateParticles(24));
  const fromConfig = LEVEL_CONFIG[fromLevel];
  const toConfig = LEVEL_CONFIG[toLevel];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('transform'), 800),
      setTimeout(() => setPhase('reveal'), 1800),
      setTimeout(() => {
        setPhase('done');
        onComplete?.();
      }, 3500),
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
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Glow ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: phase === 'transform' ? [1, 1.5, 1.2] : phase === 'reveal' ? [1.2, 2, 0] : [0, 1],
                opacity: phase === 'reveal' ? [1, 0.8, 0] : [0, 0.6],
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute w-40 h-40 rounded-full"
              style={{
                background: `radial-gradient(circle, hsl(var(--kivara-gold) / 0.4), transparent 70%)`,
                filter: 'blur(8px)',
              }}
            />

            {/* Spinning ring */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{
                scale: phase === 'enter' ? [0, 1] : phase === 'transform' ? [1, 1.1, 1] : [1, 0],
                rotate: phase === 'transform' ? 360 : 0,
                opacity: phase === 'reveal' ? 0 : 1,
              }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute w-32 h-32 rounded-full border-2 border-dashed"
              style={{ borderColor: 'hsl(var(--kivara-gold) / 0.5)' }}
            />

            {/* Particles explosion */}
            {(phase === 'transform' || phase === 'reveal') && particles.map((p) => {
              const rad = (p.angle * Math.PI) / 180;
              const distance = 80 + Math.random() * 60;
              return (
                <motion.div
                  key={p.id}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(rad) * distance,
                    y: Math.sin(rad) * distance,
                    scale: [0, 1.2, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: 'easeOut',
                  }}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                  }}
                />
              );
            })}

            {/* Star sparkles */}
            {phase === 'reveal' && Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`star-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180],
                }}
                transition={{ duration: 0.6, delay: 0.1 * i + 0.2 }}
                className="absolute text-xl"
                style={{
                  left: `${50 + Math.cos((60 * i * Math.PI) / 180) * 50}%`,
                  top: `${50 + Math.sin((60 * i * Math.PI) / 180) * 50}%`,
                }}
              >
                ✨
              </motion.div>
            ))}

            {/* Avatar transition */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {phase === 'enter' && (
                  <motion.div
                    key="old"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{
                      scale: [1, 1.3, 0],
                      opacity: [1, 0.8, 0],
                      rotate: [0, 15, -15, 0],
                    }}
                    transition={{ duration: 0.6 }}
                    className="absolute text-7xl drop-shadow-lg"
                  >
                    {fromConfig.avatar}
                  </motion.div>
                )}
                {phase === 'transform' && (
                  <motion.div
                    key="flash"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 3, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{ duration: 0.8 }}
                    className="absolute w-16 h-16 rounded-full"
                    style={{ background: 'hsl(var(--kivara-gold))' }}
                  />
                )}
                {(phase === 'reveal' || phase === 'transform') && phase === 'reveal' && (
                  <motion.div
                    key="new"
                    initial={{ scale: 0, rotate: 360, opacity: 0 }}
                    animate={{
                      scale: [0, 1.3, 1],
                      rotate: [360, 0],
                      opacity: 1,
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                    className="absolute text-7xl drop-shadow-lg"
                    style={{
                      filter: `drop-shadow(0 0 20px hsl(var(--kivara-gold) / 0.6))`,
                    }}
                  >
                    {toConfig.avatar}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Level text */}
            <AnimatePresence>
              {phase === 'reveal' && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  className="mt-8 text-center"
                >
                  <motion.p
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.1, 1] }}
                    transition={{ delay: 0.6 }}
                    className="font-display text-2xl font-bold text-foreground"
                  >
                    {t('level.unlocked')}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mt-2 flex items-center gap-2 justify-center"
                  >
                    <span className="text-sm text-muted-foreground font-display">{fromConfig.label}</span>
                    <span className="text-muted-foreground">→</span>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-sm font-display font-bold px-3 py-1 rounded-full"
                      style={{
                        background: `hsl(var(--kivara-gold) / 0.2)`,
                        color: `hsl(var(--accent-foreground))`,
                      }}
                    >
                      {toConfig.avatar} {toConfig.label}
                    </motion.span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

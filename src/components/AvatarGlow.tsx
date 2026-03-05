import { motion } from 'framer-motion';
import { Level, LEVEL_CONFIG } from '@/types/kivara';

interface AvatarGlowProps {
  level: Level;
  size?: 'sm' | 'md' | 'lg';
  showParticles?: boolean;
}

const LEVEL_GLOW_COLORS: Record<Level, string> = {
  apprentice: 'hsl(var(--kivara-blue) / 0.4)',
  saver: 'hsl(var(--kivara-green) / 0.4)',
  planner: 'hsl(var(--kivara-gold) / 0.5)',
  investor: 'hsl(270, 50%, 50%, 0.4)',
  master: 'hsl(340, 60%, 50%, 0.4)',
};

const SIZE_MAP = {
  sm: { outer: 'w-12 h-12', inner: 'w-10 h-10', text: 'text-2xl', glow: 24, particles: 4 },
  md: { outer: 'w-16 h-16', inner: 'w-14 h-14', text: 'text-3xl', glow: 32, particles: 5 },
  lg: { outer: 'w-20 h-20', inner: 'w-18 h-18', text: 'text-4xl', glow: 40, particles: 6 },
};

export function AvatarGlow({ level, size = 'md', showParticles = true }: AvatarGlowProps) {
  const config = LEVEL_CONFIG[level];
  const glowColor = LEVEL_GLOW_COLORS[level];
  const s = SIZE_MAP[size];

  return (
    <div className={`relative ${s.outer} flex items-center justify-center`}>
      {/* Pulsing glow */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
          filter: `blur(${s.glow / 4}px)`,
        }}
      />

      {/* Rotating orbit particles */}
      {showParticles && Array.from({ length: s.particles }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.3,
          }}
          className="absolute inset-0"
          style={{ transform: `rotate(${(360 / s.particles) * i}deg)` }}
        >
          <motion.div
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="absolute rounded-full"
            style={{
              width: 4,
              height: 4,
              top: -2,
              left: '50%',
              marginLeft: -2,
              backgroundColor: glowColor.replace('/ 0.4', '/ 0.9').replace('/ 0.5', '/ 0.9'),
              boxShadow: `0 0 6px ${glowColor}`,
            }}
          />
        </motion.div>
      ))}

      {/* Avatar container */}
      <motion.div
        key={level}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`${s.inner} rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg relative z-10`}
        style={{
          boxShadow: `0 0 ${s.glow}px ${glowColor}, inset 0 0 ${s.glow / 2}px ${glowColor.replace('0.4', '0.1').replace('0.5', '0.1')}`,
        }}
      >
        <span className={s.text}>{config.avatar}</span>
      </motion.div>
    </div>
  );
}

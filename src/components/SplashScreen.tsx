import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import kivaraWhiteLogo from '@/assets/logo-kivara-white.svg';
import heroFamily from '@/assets/landing/hero-family.png';
import { useT } from '@/contexts/LanguageContext';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const t = useT();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, hsl(214 64% 18%), hsl(214 64% 28%), hsl(160 54% 30%))',
          }}
        >
          {[
            { size: 120, x: '15%', y: '20%', delay: 0.5, duration: 5 },
            { size: 80, x: '80%', y: '70%', delay: 1.0, duration: 6 },
            { size: 60, x: '70%', y: '15%', delay: 0.8, duration: 4.5 },
          ].map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: p.x,
                top: p.y,
                background: 'radial-gradient(circle, hsla(160 54% 50% / 0.15), transparent 70%)',
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0.6, 0.3, 0.6, 0],
                scale: [0.5, 1.1, 0.9, 1.05, 0.5],
                y: [0, -20, -10, -25, 0],
              }}
              transition={{
                delay: p.delay,
                duration: p.duration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          <motion.img
            src={heroFamily}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
            style={{ opacity: 0, filter: 'blur(2px)' }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.12, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 20%, hsla(214 64% 12% / 0.6) 80%)',
            }}
          />

          <div className="relative z-10 flex flex-col items-center px-6">
            <motion.img
              src={kivaraWhiteLogo}
              alt="Kivara"
              className="h-28 sm:h-32 w-auto drop-shadow-lg"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18, duration: 0.5 }}
            />

            <motion.h1
              className="mt-5 text-4xl sm:text-5xl font-display font-bold text-primary-foreground tracking-tight drop-shadow-md"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Kivara
            </motion.h1>

            <motion.p
              className="mt-3 text-lg sm:text-xl font-display font-semibold tracking-wide"
              style={{
                background: 'linear-gradient(90deg, hsl(39 89% 57%), hsl(39 89% 70%), hsl(39 89% 57%))',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 3s ease infinite',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.5 }}
            >
              {t('splash.tagline')}
            </motion.p>

            <motion.p
              className="text-sm sm:text-base text-primary-foreground/60 mt-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95, duration: 0.4 }}
            >
              {t('splash.subtitle')}
            </motion.p>

            <motion.div
              className="mt-10 h-1.5 w-24 rounded-full overflow-hidden"
              style={{
                background: 'hsla(0 0% 100% / 0.15)',
                boxShadow: '0 0 20px hsla(160 54% 50% / 0.2)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(160 54% 50%), hsl(39 89% 57%))',
                  boxShadow: '0 0 12px hsla(160 54% 50% / 0.6)',
                }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.1, duration: 1.8, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

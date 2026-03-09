import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playUnlockFanfare, hapticSuccess } from '@/lib/celebration-effects';
import { useT } from '@/contexts/LanguageContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  'hsl(45, 100%, 60%)',   // gold
  'hsl(280, 80%, 65%)',   // purple
  'hsl(160, 70%, 50%)',   // green
  'hsl(340, 85%, 60%)',   // pink
  'hsl(200, 90%, 55%)',   // blue
  'hsl(25, 95%, 55%)',    // orange
];

function createParticles(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: width / 2 + (Math.random() - 0.5) * width * 0.3,
    y: height * 0.3,
    vx: (Math.random() - 0.5) * 12,
    vy: -Math.random() * 14 - 4,
    size: Math.random() * 8 + 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 15,
    opacity: 1,
  }));
}

interface ConfettiCelebrationProps {
  active: boolean;
  onComplete?: () => void;
  vaultName?: string;
  vaultIcon?: string;
}

export function ConfettiCelebration({ active, onComplete, vaultName, vaultIcon }: ConfettiCelebrationProps) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!active) return;

    playUnlockFanfare();
    hapticSuccess();
    setShowBanner(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particlesRef.current = createParticles(80, canvas.width, canvas.height);

    const gravity = 0.3;
    const friction = 0.99;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = 0;
      for (const p of particlesRef.current) {
        p.vy += gravity;
        p.vx *= friction;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.005;

        if (p.opacity <= 0) continue;
        alive++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      if (alive > 0) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setShowBanner(false);
        onComplete?.();
      }
    }

    animRef.current = requestAnimationFrame(animate);

    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 3500);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(timer);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <AnimatePresence>
        {showBanner && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="bg-card/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-primary/30 text-center max-w-xs mx-4">
              <motion.div
                className="text-6xl mb-3"
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {vaultIcon ?? '🎉'}
              </motion.div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                {t('confetti.goal_reached')}
              </h2>
              {vaultName && (
                <p className="text-sm text-muted-foreground">
                  {t('confetti.vault_reached').replace('{name}', vaultName)}
                </p>
              )}
              <motion.div
                className="mt-3 text-xs text-secondary font-display font-bold"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {t('confetti.congrats')}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion } from 'framer-motion';
import {
  PiggyBank, Target, Trophy, BarChart3, Users, BookOpen,
  Coins, Star, TrendingUp, Shield, Building2, Activity,
  Handshake, Award, GraduationCap, Sparkles, Heart, Rocket,
  Wallet, ArrowUpRight, Flame, ChartPie,
} from 'lucide-react';
import kivoSvg from '@/assets/kivo.svg';

/* ── Shared animation helpers ── */

function Kivo({ size = 80 }: { size?: number }) {
  return (
    <motion.img
      src={kivoSvg}
      alt="Kivo"
      className="drop-shadow-xl relative z-10"
      style={{
        width: size,
        height: size,
        filter: 'drop-shadow(0 0 20px hsl(var(--kivara-gold) / 0.4))',
      }}
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
    />
  );
}

/** Glowing concentric rings behind a focal element */
function GlowRings({ color = 'var(--primary)', count = 3 }: { color?: string; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 100 + i * 60,
            height: 100 + i * 60,
            border: `1.5px solid hsl(${color} / ${0.25 - i * 0.06})`,
            boxShadow: `0 0 ${12 + i * 8}px hsl(${color} / ${0.12 - i * 0.03})`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

/** Floating sparkle particles */
function Particles({ count = 5, color = 'var(--kivara-gold)' }: { count?: number; color?: string }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        const radius = 70 + Math.random() * 40;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 4 + Math.random() * 4,
              height: 4 + Math.random() * 4,
              background: `hsl(${color})`,
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: [0, x, x * 0.8, x],
              y: [0, y, y * 1.2, y],
              opacity: [0, 0.8, 0.4, 0.8],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </>
  );
}

/** Icon that orbits around center */
function OrbitIcon({
  icon: Icon,
  radius = 70,
  duration = 8,
  delay = 0,
  size = 10,
  colorClass = 'text-primary',
}: {
  icon: React.ElementType;
  radius?: number;
  duration?: number;
  delay?: number;
  size?: number;
  colorClass?: string;
}) {
  return (
    <motion.div
      className={`absolute ${colorClass}`}
      style={{ left: '50%', top: '50%', marginLeft: -size / 2, marginTop: -size / 2 }}
      animate={{
        x: [
          Math.cos(0) * radius,
          Math.cos(Math.PI / 2) * radius,
          Math.cos(Math.PI) * radius,
          Math.cos((3 * Math.PI) / 2) * radius,
          Math.cos(2 * Math.PI) * radius,
        ],
        y: [
          Math.sin(0) * radius,
          Math.sin(Math.PI / 2) * radius,
          Math.sin(Math.PI) * radius,
          Math.sin((3 * Math.PI) / 2) * radius,
          Math.sin(2 * Math.PI) * radius,
        ],
      }}
      transition={{ duration, repeat: Infinity, delay, ease: 'linear' }}
    >
      <Icon style={{ width: size, height: size }} />
    </motion.div>
  );
}

/** Icon that scales in with stagger */
function PopIcon({
  icon: Icon,
  delay = 0,
  className = '',
  glow,
}: {
  icon: React.ElementType;
  delay?: number;
  className?: string;
  glow?: string;
}) {
  return (
    <motion.div
      className={className}
      style={glow ? { filter: `drop-shadow(0 0 8px ${glow})` } : undefined}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
    >
      <Icon className="w-full h-full" />
    </motion.div>
  );
}

/** Pulsing ring behind central element */
function PulseRing({ color = 'var(--primary)', size = 80 }: { color?: string; size?: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        border: `2px solid hsl(${color} / 0.3)`,
      }}
      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/** Background gradient layer */
function BgGradient({ from, to }: { from: string; to: string }) {
  return (
    <div
      className="absolute inset-0 rounded-3xl"
      style={{
        background: `linear-gradient(135deg, hsl(${from} / 0.2), hsl(${to} / 0.15))`,
      }}
    />
  );
}

/* ── Illustrations ── */

const illustrations: Record<string, React.FC> = {
  'parent-welcome': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-blue)" to="var(--kivara-green)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-gold)" count={3} />
        <Particles count={6} color="var(--kivara-gold)" />
        <Kivo size={100} />
        <OrbitIcon icon={Users} radius={80} duration={10} size={20} colorClass="text-primary" />
        <OrbitIcon icon={Heart} radius={80} duration={10} delay={3.3} size={16} colorClass="text-accent" />
        <OrbitIcon icon={Sparkles} radius={80} duration={10} delay={6.6} size={18} colorClass="text-secondary" />
        <motion.div
          className="mt-4 text-4xl"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          👨‍👩‍👧‍👦
        </motion.div>
      </div>
    </div>
  ),

  'parent-tasks': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-green)" to="var(--kivara-gold)" />
      <div className="relative flex flex-col items-center">
        <PulseRing color="var(--kivara-green)" size={100} />
        <motion.div
          className="text-6xl relative z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          ✅
        </motion.div>
        <div className="flex gap-6 mt-6 items-end">
          <PopIcon icon={Target} delay={0.3} className="w-12 h-12 text-primary" glow="hsl(var(--kivara-blue) / 0.4)" />
          <PopIcon icon={Coins} delay={0.5} className="w-10 h-10 text-accent" glow="hsl(var(--kivara-gold) / 0.4)" />
          <PopIcon icon={Star} delay={0.7} className="w-11 h-11 text-secondary" glow="hsl(var(--kivara-green) / 0.4)" />
        </div>
        <Particles count={4} color="var(--kivara-green)" />
      </div>
    </div>
  ),

  'parent-dashboard': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-blue)" to="var(--kivara-green)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-blue)" count={2} />
        {/* Animated bar chart */}
        <div className="flex items-end gap-2 mb-4">
          {[40, 65, 50, 80, 60].map((h, i) => (
            <motion.div
              key={i}
              className="w-5 rounded-t-md"
              style={{
                background: i % 2 === 0
                  ? 'hsl(var(--kivara-blue))'
                  : 'hsl(var(--kivara-green))',
              }}
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          <PopIcon icon={TrendingUp} delay={0.8} className="w-10 h-10 text-secondary" glow="hsl(var(--kivara-green) / 0.3)" />
          <PopIcon icon={BarChart3} delay={1} className="w-10 h-10 text-primary" glow="hsl(var(--kivara-blue) / 0.3)" />
          <PopIcon icon={Activity} delay={1.2} className="w-10 h-10 text-accent" />
        </div>
        <Particles count={4} color="var(--kivara-blue)" />
      </div>
    </div>
  ),

  'parent-savings': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-gold)" to="var(--kivara-blue)" />
      <div className="relative flex flex-col items-center">
        <PulseRing color="var(--kivara-gold)" size={110} />
        <GlowRings color="var(--kivara-gold)" count={2} />
        <motion.div
          className="text-6xl relative z-10"
          style={{ filter: 'drop-shadow(0 0 16px hsl(var(--kivara-gold) / 0.5))' }}
          animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🐷
        </motion.div>
        <div className="flex gap-5 items-end mt-5">
          <PopIcon icon={PiggyBank} delay={0.3} className="w-12 h-12 text-accent" glow="hsl(var(--kivara-gold) / 0.4)" />
          <PopIcon icon={Coins} delay={0.5} className="w-10 h-10 text-secondary" />
          <PopIcon icon={Sparkles} delay={0.7} className="w-9 h-9 text-primary" />
        </div>
        <Particles count={5} color="var(--kivara-gold)" />
      </div>
    </div>
  ),

  'child-kivo': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-green)" to="var(--kivara-gold)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-gold)" count={3} />
        <Particles count={7} color="var(--kivara-gold)" />
        <Kivo size={120} />
        <OrbitIcon icon={Star} radius={85} duration={9} size={16} colorClass="text-accent" />
        <OrbitIcon icon={Heart} radius={85} duration={9} delay={3} size={14} colorClass="text-destructive" />
        <OrbitIcon icon={Sparkles} radius={85} duration={9} delay={6} size={16} colorClass="text-secondary" />
        <motion.div
          className="text-4xl mt-3"
          animate={{ rotate: [0, 14, -14, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        >
          👋
        </motion.div>
      </div>
    </div>
  ),

  'child-coins': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-gold)" to="var(--kivara-green)" />
      <div className="relative flex flex-col items-center">
        <PulseRing color="var(--kivara-gold)" size={90} />
        {/* Coin stack */}
        <div className="relative z-10 flex flex-col items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="text-4xl"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.2, type: 'spring', stiffness: 200 }}
              style={{ marginTop: i > 0 ? -10 : 0 }}
            >
              🪙
            </motion.div>
          ))}
        </div>
        <div className="flex gap-5 mt-4">
          <PopIcon icon={Target} delay={0.6} className="w-11 h-11 text-primary" glow="hsl(var(--kivara-blue) / 0.3)" />
          <PopIcon icon={Rocket} delay={0.8} className="w-10 h-10 text-secondary" glow="hsl(var(--kivara-green) / 0.3)" />
          <PopIcon icon={Star} delay={1} className="w-11 h-11 text-accent" glow="hsl(var(--kivara-gold) / 0.4)" />
        </div>
        <Particles count={5} color="var(--kivara-gold)" />
      </div>
    </div>
  ),

  'child-dreams': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-blue)" to="var(--kivara-gold)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-blue)" count={2} />
        <PulseRing color="var(--kivara-gold)" size={100} />
        <motion.div
          className="text-6xl relative z-10"
          style={{ filter: 'drop-shadow(0 0 20px hsl(var(--kivara-gold) / 0.5))' }}
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✨
        </motion.div>
        <PopIcon icon={PiggyBank} delay={0.4} className="w-14 h-14 text-accent mt-3" glow="hsl(var(--kivara-gold) / 0.4)" />
        <div className="flex gap-4 mt-2">
          <motion.div
            className="text-3xl"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
          >
            💰
          </motion.div>
          <motion.div
            className="text-3xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            🎯
          </motion.div>
        </div>
        <Particles count={6} color="var(--kivara-gold)" />
      </div>
    </div>
  ),

  'child-achievements': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-gold)" to="var(--kivara-blue)" />
      <div className="relative flex flex-col items-center">
        {/* Radiating light rays */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: 2,
              height: 40,
              background: `hsl(var(--kivara-gold) / 0.2)`,
              transformOrigin: 'bottom center',
              rotate: `${i * 45}deg`,
              top: -20,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: [0, 1, 0.8, 1], opacity: [0, 0.6, 0.3, 0.6] }}
            transition={{ delay: 0.5 + i * 0.1, duration: 3, repeat: Infinity }}
          />
        ))}
        <PulseRing color="var(--kivara-gold)" size={100} />
        <motion.div
          className="text-6xl relative z-10"
          style={{ filter: 'drop-shadow(0 0 16px hsl(var(--kivara-gold) / 0.5))' }}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        >
          🏆
        </motion.div>
        <div className="flex gap-4 mt-5">
          <PopIcon icon={Trophy} delay={0.5} className="w-10 h-10 text-accent" glow="hsl(var(--kivara-gold) / 0.4)" />
          <PopIcon icon={Award} delay={0.7} className="w-12 h-12 text-secondary" glow="hsl(var(--kivara-green) / 0.3)" />
          <PopIcon icon={Star} delay={0.9} className="w-10 h-10 text-primary" glow="hsl(var(--kivara-blue) / 0.3)" />
        </div>
        <Particles count={6} color="var(--kivara-gold)" />
      </div>
    </div>
  ),


  /* ── Teen-specific illustrations ── */

  'teen-welcome': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-blue)" to="var(--kivara-green)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-blue)" count={3} />
        <Particles count={6} color="var(--kivara-green)" />
        <Kivo size={100} />
        <OrbitIcon icon={Wallet} radius={82} duration={10} size={20} colorClass="text-primary" />
        <OrbitIcon icon={TrendingUp} radius={82} duration={10} delay={2.5} size={18} colorClass="text-secondary" />
        <OrbitIcon icon={Rocket} radius={82} duration={10} delay={5} size={18} colorClass="text-accent" />
        <OrbitIcon icon={Star} radius={82} duration={10} delay={7.5} size={16} colorClass="text-accent" />
        <motion.div
          className="mt-3 text-3xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          💪
        </motion.div>
      </div>
    </div>
  ),

  'teen-budget': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-green)" to="var(--kivara-blue)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-green)" count={2} />
        {/* Budget pie chart representation */}
        <motion.div
          className="relative z-10 w-20 h-20 rounded-full border-4 border-primary mb-3"
          style={{
            background: `conic-gradient(
              hsl(var(--kivara-blue)) 0% 35%,
              hsl(var(--kivara-green)) 35% 60%,
              hsl(var(--kivara-gold)) 60% 80%,
              hsl(var(--kivara-blue) / 0.3) 80% 100%
            )`,
          }}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 15, delay: 0.2 }}
        />
        <div className="flex gap-5 mt-3">
          <PopIcon icon={ChartPie} delay={0.5} className="w-11 h-11 text-primary" glow="hsl(var(--kivara-blue) / 0.3)" />
          <PopIcon icon={Wallet} delay={0.7} className="w-10 h-10 text-secondary" glow="hsl(var(--kivara-green) / 0.3)" />
          <PopIcon icon={ArrowUpRight} delay={0.9} className="w-10 h-10 text-accent" />
        </div>
        <Particles count={4} color="var(--kivara-green)" />
      </div>
    </div>
  ),

  'teen-invest': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-gold)" to="var(--kivara-green)" />
      <div className="relative flex flex-col items-center">
        <PulseRing color="var(--kivara-gold)" size={110} />
        <GlowRings color="var(--kivara-gold)" count={2} />
        {/* Growing compound interest bars */}
        <div className="flex items-end gap-2 mb-3 relative z-10">
          {[20, 30, 45, 65, 90].map((h, i) => (
            <motion.div
              key={i}
              className="w-5 rounded-t-md"
              style={{
                background: `hsl(var(--kivara-green) / ${0.5 + i * 0.1})`,
                boxShadow: i === 4 ? '0 0 12px hsl(var(--kivara-green) / 0.4)' : undefined,
              }}
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </div>
        <div className="flex gap-5 mt-3">
          <PopIcon icon={TrendingUp} delay={0.8} className="w-11 h-11 text-secondary" glow="hsl(var(--kivara-green) / 0.4)" />
          <PopIcon icon={Coins} delay={1} className="w-10 h-10 text-accent" glow="hsl(var(--kivara-gold) / 0.4)" />
          <PopIcon icon={PiggyBank} delay={1.2} className="w-10 h-10 text-primary" />
        </div>
        <Particles count={5} color="var(--kivara-gold)" />
      </div>
    </div>
  ),

  'teen-level-up': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-blue)" to="var(--kivara-gold)" />
      <div className="relative flex flex-col items-center">
        {/* Radiating rays */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: 2,
              height: 36,
              background: `hsl(var(--kivara-gold) / 0.18)`,
              transformOrigin: 'bottom center',
              rotate: `${i * 45}deg`,
              top: -16,
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 0.7, 1], opacity: [0, 0.5, 0.2, 0.5] }}
            transition={{ delay: 0.5 + i * 0.08, duration: 3, repeat: Infinity }}
          />
        ))}
        <PulseRing color="var(--kivara-gold)" size={100} />
        <motion.div
          className="text-5xl relative z-10"
          style={{ filter: 'drop-shadow(0 0 14px hsl(var(--kivara-gold) / 0.5))' }}
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
        >
          ⚡
        </motion.div>
        <div className="flex gap-4 mt-5">
          <PopIcon icon={Flame} delay={0.4} className="w-10 h-10 text-destructive" glow="hsl(0 72% 55% / 0.3)" />
          <PopIcon icon={Award} delay={0.6} className="w-12 h-12 text-accent" glow="hsl(var(--kivara-gold) / 0.4)" />
          <PopIcon icon={Trophy} delay={0.8} className="w-10 h-10 text-primary" glow="hsl(var(--kivara-blue) / 0.3)" />
        </div>
        <Particles count={6} color="var(--kivara-gold)" />
      </div>
    </div>
  ),

  'teacher-classroom': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-blue)" to="var(--kivara-green)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-blue)" count={3} />
        <Particles count={5} color="var(--kivara-blue)" />
        <Kivo size={86} />
        <OrbitIcon icon={GraduationCap} radius={75} duration={10} size={20} colorClass="text-primary" />
        <OrbitIcon icon={BookOpen} radius={75} duration={10} delay={3.3} size={18} colorClass="text-secondary" />
        <OrbitIcon icon={Users} radius={75} duration={10} delay={6.6} size={18} colorClass="text-accent" />
      </div>
    </div>
  ),

  'teacher-manage': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-green)" to="var(--kivara-blue)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-green)" count={2} />
        <PopIcon icon={Users} delay={0.2} className="w-14 h-14 text-primary" glow="hsl(var(--kivara-blue) / 0.3)" />
        <div className="flex gap-5 mt-5">
          <PopIcon icon={BarChart3} delay={0.5} className="w-10 h-10 text-secondary" />
          <motion.div
            className="text-4xl"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            📋
          </motion.div>
          <PopIcon icon={TrendingUp} delay={0.7} className="w-10 h-10 text-accent" />
        </div>
        <Particles count={4} color="var(--kivara-green)" />
      </div>
    </div>
  ),

  'teacher-challenges': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-gold)" to="var(--kivara-green)" />
      <div className="relative flex flex-col items-center">
        <PulseRing color="var(--kivara-gold)" size={100} />
        <motion.div
          className="text-6xl relative z-10"
          style={{ filter: 'drop-shadow(0 0 12px hsl(var(--kivara-gold) / 0.4))' }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🏅
        </motion.div>
        <div className="flex gap-5 mt-5">
          <PopIcon icon={Trophy} delay={0.4} className="w-11 h-11 text-accent" glow="hsl(var(--kivara-gold) / 0.4)" />
          <PopIcon icon={Target} delay={0.6} className="w-10 h-10 text-primary" />
          <PopIcon icon={Sparkles} delay={0.8} className="w-10 h-10 text-secondary" />
        </div>
        <Particles count={5} color="var(--kivara-gold)" />
      </div>
    </div>
  ),

  'admin-overview': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-blue)" to="var(--kivara-blue)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-blue)" count={3} />
        <Particles count={5} color="var(--kivara-blue)" />
        <Kivo size={86} />
        <OrbitIcon icon={Shield} radius={78} duration={10} size={20} colorClass="text-primary" />
        <OrbitIcon icon={Activity} radius={78} duration={10} delay={3.3} size={18} colorClass="text-secondary" />
        <OrbitIcon icon={Building2} radius={78} duration={10} delay={6.6} size={18} colorClass="text-accent" />
      </div>
    </div>
  ),

  'admin-tenants': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-green)" to="var(--kivara-blue)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-green)" count={2} />
        <PopIcon icon={Building2} delay={0.2} className="w-14 h-14 text-primary" glow="hsl(var(--kivara-blue) / 0.3)" />
        <div className="flex gap-5 mt-5">
          <PopIcon icon={Users} delay={0.5} className="w-10 h-10 text-secondary" />
          <motion.div
            className="text-4xl"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🏢
          </motion.div>
          <PopIcon icon={Shield} delay={0.7} className="w-10 h-10 text-accent" />
        </div>
        <Particles count={4} color="var(--kivara-blue)" />
      </div>
    </div>
  ),

  'admin-analytics': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-gold)" to="var(--kivara-blue)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-blue)" count={2} />
        {/* Animated bar chart */}
        <div className="flex items-end gap-2 mb-3">
          {[35, 55, 70, 45, 80, 60].map((h, i) => (
            <motion.div
              key={i}
              className="w-4 rounded-t-md"
              style={{
                background: i % 2 === 0
                  ? 'hsl(var(--kivara-blue))'
                  : 'hsl(var(--kivara-gold))',
              }}
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          <PopIcon icon={TrendingUp} delay={0.8} className="w-10 h-10 text-secondary" />
          <PopIcon icon={Activity} delay={1} className="w-10 h-10 text-accent" />
        </div>
        <motion.div
          className="text-4xl mt-2"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          📈
        </motion.div>
        <Particles count={4} color="var(--kivara-blue)" />
      </div>
    </div>
  ),

  'partner-welcome': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-blue)" to="var(--kivara-green)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-green)" count={3} />
        <Particles count={6} color="var(--kivara-green)" />
        <Kivo size={86} />
        <OrbitIcon icon={Handshake} radius={78} duration={10} size={20} colorClass="text-primary" />
        <OrbitIcon icon={Heart} radius={78} duration={10} delay={3.3} size={16} colorClass="text-accent" />
        <OrbitIcon icon={Sparkles} radius={78} duration={10} delay={6.6} size={18} colorClass="text-secondary" />
      </div>
    </div>
  ),

  'partner-programs': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-green)" to="var(--kivara-gold)" />
      <div className="relative flex flex-col items-center">
        <GlowRings color="var(--kivara-green)" count={2} />
        <motion.div
          className="text-5xl relative z-10"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          📋
        </motion.div>
        <div className="flex gap-5 mt-5">
          <PopIcon icon={BookOpen} delay={0.4} className="w-10 h-10 text-primary" glow="hsl(var(--kivara-blue) / 0.3)" />
          <PopIcon icon={Users} delay={0.6} className="w-10 h-10 text-secondary" glow="hsl(var(--kivara-green) / 0.3)" />
        </div>
        <Particles count={4} color="var(--kivara-green)" />
      </div>
    </div>
  ),

  'partner-challenges': () => (
    <div className="relative flex items-center justify-center h-full overflow-hidden">
      <BgGradient from="var(--kivara-gold)" to="var(--kivara-blue)" />
      <div className="relative flex flex-col items-center">
        <PulseRing color="var(--kivara-gold)" size={100} />
        {/* Light rays */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: 2,
              height: 35,
              background: `hsl(var(--kivara-gold) / 0.15)`,
              transformOrigin: 'bottom center',
              rotate: `${i * 60}deg`,
              top: -15,
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 0.7, 1], opacity: [0, 0.5, 0.2, 0.5] }}
            transition={{ delay: 0.4 + i * 0.1, duration: 3, repeat: Infinity }}
          />
        ))}
        <motion.div
          className="text-6xl relative z-10"
          style={{ filter: 'drop-shadow(0 0 16px hsl(var(--kivara-gold) / 0.5))' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        >
          🏆
        </motion.div>
        <div className="flex gap-4 mt-5">
          <PopIcon icon={Trophy} delay={0.5} className="w-11 h-11 text-accent" glow="hsl(var(--kivara-gold) / 0.4)" />
          <PopIcon icon={TrendingUp} delay={0.7} className="w-10 h-10 text-secondary" />
          <PopIcon icon={Target} delay={0.9} className="w-10 h-10 text-primary" />
        </div>
        <Particles count={5} color="var(--kivara-gold)" />
      </div>
    </div>
  ),
};

export function SplashIllustration({ illustrationKey }: { illustrationKey: string }) {
  const Illustration = illustrations[illustrationKey];
  if (!Illustration) return null;
  return (
    <div className="w-full h-56 sm:h-64 md:h-72 lg:h-80 p-6">
      <Illustration />
    </div>
  );
}

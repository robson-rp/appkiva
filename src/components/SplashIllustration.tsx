import { motion } from 'framer-motion';
import {
  PiggyBank, Target, Trophy, BarChart3, Users, BookOpen,
  Coins, Star, TrendingUp, Shield, Building2, Activity,
  Handshake, Award, GraduationCap, Sparkles, Heart, Rocket,
} from 'lucide-react';
import kivoSvg from '@/assets/kivo.svg';

const float = {
  animate: { y: [0, -8, 0] },
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
};

const floatSlow = {
  animate: { y: [0, -5, 0] },
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 },
};

function Kivo({ size = 80 }: { size?: number }) {
  return (
    <motion.img
      src={kivoSvg}
      alt="Kivo"
      className="drop-shadow-lg"
      style={{ width: size, height: size }}
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
    />
  );
}

function FloatingIcon({ icon: Icon, className, delay = 0 }: { icon: React.ElementType; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <Icon className="w-full h-full" />
    </motion.div>
  );
}

const illustrations: Record<string, React.FC> = {
  'parent-welcome': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(213,64%,34%)]/20 to-[hsl(164,54%,40%)]/20 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-4">
        <Kivo size={96} />
        <div className="flex gap-4 mt-2">
          <FloatingIcon icon={Users} className="w-10 h-10 text-primary" delay={0} />
          <FloatingIcon icon={Heart} className="w-8 h-8 text-chart-4" delay={0.5} />
          <FloatingIcon icon={Sparkles} className="w-10 h-10 text-chart-3" delay={1} />
        </div>
        <motion.div {...float} className="text-5xl mt-1">👨‍👩‍👧‍👦</motion.div>
      </div>
    </div>
  ),

  'parent-tasks': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(164,54%,40%)]/15 to-[hsl(43,88%,58%)]/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <motion.div {...float} className="text-6xl">✅</motion.div>
        <div className="flex gap-5 items-end">
          <FloatingIcon icon={Target} className="w-12 h-12 text-primary" delay={0.2} />
          <FloatingIcon icon={Coins} className="w-10 h-10 text-chart-4" delay={0.7} />
          <FloatingIcon icon={Star} className="w-11 h-11 text-chart-3" delay={0.4} />
        </div>
      </div>
    </div>
  ),

  'parent-dashboard': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-chart-3/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <FloatingIcon icon={BarChart3} className="w-16 h-16 text-primary" delay={0} />
        <div className="flex gap-4">
          <FloatingIcon icon={TrendingUp} className="w-10 h-10 text-chart-3" delay={0.3} />
          <motion.div {...floatSlow} className="text-5xl">📊</motion.div>
          <FloatingIcon icon={Activity} className="w-10 h-10 text-chart-4" delay={0.6} />
        </div>
      </div>
    </div>
  ),

  'parent-savings': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-4/15 to-primary/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <motion.div {...float} className="text-6xl">🐷</motion.div>
        <div className="flex gap-5 items-end">
          <FloatingIcon icon={PiggyBank} className="w-12 h-12 text-chart-4" delay={0.1} />
          <FloatingIcon icon={Coins} className="w-10 h-10 text-chart-3" delay={0.5} />
          <FloatingIcon icon={Sparkles} className="w-9 h-9 text-primary" delay={0.8} />
        </div>
      </div>
    </div>
  ),

  'child-kivo': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-3/20 to-chart-4/20 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-3">
        <Kivo size={112} />
        <motion.div
          className="text-4xl"
          animate={{ rotate: [0, 14, -14, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        >
          👋
        </motion.div>
      </div>
    </div>
  ),

  'child-coins': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-4/20 to-chart-3/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <motion.div {...float} className="text-6xl">🪙</motion.div>
        <div className="flex gap-4">
          <FloatingIcon icon={Target} className="w-11 h-11 text-primary" delay={0} />
          <FloatingIcon icon={Rocket} className="w-10 h-10 text-chart-3" delay={0.4} />
          <FloatingIcon icon={Star} className="w-11 h-11 text-chart-4" delay={0.8} />
        </div>
      </div>
    </div>
  ),

  'child-dreams': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-chart-4/20 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <motion.div {...float} className="text-6xl">✨</motion.div>
        <FloatingIcon icon={PiggyBank} className="w-14 h-14 text-chart-4" delay={0.2} />
        <div className="flex gap-3">
          <motion.div {...floatSlow} className="text-3xl">💰</motion.div>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }} className="text-3xl">🎯</motion.div>
        </div>
      </div>
    </div>
  ),

  'child-achievements': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-4/20 to-primary/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <motion.div {...float} className="text-6xl">🏆</motion.div>
        <div className="flex gap-4">
          <FloatingIcon icon={Trophy} className="w-10 h-10 text-chart-4" delay={0} />
          <FloatingIcon icon={Award} className="w-12 h-12 text-chart-3" delay={0.3} />
          <FloatingIcon icon={Star} className="w-10 h-10 text-primary" delay={0.6} />
        </div>
      </div>
    </div>
  ),

  'teacher-classroom': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-3/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-4">
        <Kivo size={80} />
        <div className="flex gap-4">
          <FloatingIcon icon={GraduationCap} className="w-12 h-12 text-primary" delay={0} />
          <FloatingIcon icon={BookOpen} className="w-10 h-10 text-chart-3" delay={0.4} />
          <FloatingIcon icon={Users} className="w-11 h-11 text-chart-4" delay={0.8} />
        </div>
      </div>
    </div>
  ),

  'teacher-manage': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-3/15 to-primary/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <FloatingIcon icon={Users} className="w-14 h-14 text-primary" delay={0} />
        <div className="flex gap-4">
          <FloatingIcon icon={BarChart3} className="w-10 h-10 text-chart-3" delay={0.3} />
          <motion.div {...float} className="text-4xl">📋</motion.div>
          <FloatingIcon icon={TrendingUp} className="w-10 h-10 text-chart-4" delay={0.6} />
        </div>
      </div>
    </div>
  ),

  'teacher-challenges': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-4/15 to-chart-3/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <motion.div {...float} className="text-6xl">🏅</motion.div>
        <div className="flex gap-4">
          <FloatingIcon icon={Trophy} className="w-11 h-11 text-chart-4" delay={0.2} />
          <FloatingIcon icon={Target} className="w-10 h-10 text-primary" delay={0.5} />
          <FloatingIcon icon={Sparkles} className="w-10 h-10 text-chart-3" delay={0.8} />
        </div>
      </div>
    </div>
  ),

  'admin-overview': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-[hsl(213,64%,34%)]/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-4">
        <Kivo size={80} />
        <div className="flex gap-4">
          <FloatingIcon icon={Shield} className="w-12 h-12 text-primary" delay={0} />
          <FloatingIcon icon={Activity} className="w-10 h-10 text-chart-3" delay={0.4} />
          <FloatingIcon icon={Building2} className="w-11 h-11 text-chart-4" delay={0.8} />
        </div>
      </div>
    </div>
  ),

  'admin-tenants': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-3/15 to-primary/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <FloatingIcon icon={Building2} className="w-14 h-14 text-primary" delay={0} />
        <div className="flex gap-4">
          <FloatingIcon icon={Users} className="w-10 h-10 text-chart-3" delay={0.3} />
          <motion.div {...float} className="text-4xl">🏢</motion.div>
          <FloatingIcon icon={Shield} className="w-10 h-10 text-chart-4" delay={0.6} />
        </div>
      </div>
    </div>
  ),

  'admin-analytics': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-4/15 to-primary/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <FloatingIcon icon={BarChart3} className="w-14 h-14 text-primary" delay={0} />
        <div className="flex gap-4">
          <FloatingIcon icon={TrendingUp} className="w-10 h-10 text-chart-3" delay={0.2} />
          <FloatingIcon icon={Activity} className="w-10 h-10 text-chart-4" delay={0.5} />
        </div>
        <motion.div {...floatSlow} className="text-4xl">📈</motion.div>
      </div>
    </div>
  ),

  'partner-welcome': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-3/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-4">
        <Kivo size={80} />
        <div className="flex gap-4">
          <FloatingIcon icon={Handshake} className="w-12 h-12 text-primary" delay={0} />
          <FloatingIcon icon={Heart} className="w-10 h-10 text-chart-4" delay={0.4} />
          <FloatingIcon icon={Sparkles} className="w-10 h-10 text-chart-3" delay={0.8} />
        </div>
      </div>
    </div>
  ),

  'partner-programs': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-3/15 to-chart-4/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <motion.div {...float} className="text-5xl">📋</motion.div>
        <div className="flex gap-4">
          <FloatingIcon icon={BookOpen} className="w-10 h-10 text-primary" delay={0.2} />
          <FloatingIcon icon={Users} className="w-10 h-10 text-chart-3" delay={0.5} />
        </div>
      </div>
    </div>
  ),

  'partner-challenges': () => (
    <div className="relative flex items-center justify-center h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-4/15 to-primary/15 rounded-3xl" />
      <div className="relative flex flex-col items-center gap-5">
        <motion.div {...float} className="text-6xl">🏆</motion.div>
        <div className="flex gap-4">
          <FloatingIcon icon={Trophy} className="w-11 h-11 text-chart-4" delay={0} />
          <FloatingIcon icon={TrendingUp} className="w-10 h-10 text-chart-3" delay={0.4} />
          <FloatingIcon icon={Target} className="w-10 h-10 text-primary" delay={0.7} />
        </div>
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

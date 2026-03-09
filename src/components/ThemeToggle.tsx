import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { useT } from '@/contexts/LanguageContext';

export function ThemeToggle() {
  const t = useT();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative p-2.5 rounded-2xl hover:bg-muted/80 transition-all duration-200 active:scale-95"
      aria-label={t('theme.toggle')}
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? (
          <Sun className="h-[18px] w-[18px] text-muted-foreground" />
        ) : (
          <Moon className="h-[18px] w-[18px] text-muted-foreground" />
        )}
      </motion.div>
    </button>
  );
}

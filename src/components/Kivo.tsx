import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { KIVO_TIPS } from '@/data/kivo-tips';
import kivoImg from '@/assets/kivo.svg';
import { useT } from '@/contexts/LanguageContext';

interface KivoProps {
  page: keyof typeof KIVO_TIPS;
}

export function Kivo({ page }: KivoProps) {
  const t = useT();
  const tips = KIVO_TIPS[page] || KIVO_TIPS.dashboard;
  const [tipIndex, setTipIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * tips.length));
    setVisible(true);
  }, [page]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6 flex items-end gap-2 max-w-xs"
        >
          <div className="relative bg-card border border-border rounded-2xl rounded-br-sm p-4 shadow-kivara">
            <button
              onClick={() => setVisible(false)}
              className="absolute top-1 right-1 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
            <p className="text-sm font-body pr-4">{tips[tipIndex]}</p>
            <button
              onClick={() => setTipIndex((i) => (i + 1) % tips.length)}
              className="mt-2 text-xs text-primary font-semibold hover:underline"
            >
              {t('kivo.next_tip')}
            </button>
          </div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="cursor-pointer select-none flex-shrink-0"
            onClick={() => setVisible(true)}
          >
            <img src={kivoImg} alt="Kivo" className="w-16 h-16" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useOnlineStatus } from '@/hooks/use-online-status';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext } from 'react';

// Import the context directly to avoid the throw in useLanguage
// This makes OfflineBanner resilient to HMR module duplication
function useSafeT() {
  // We access LanguageContext via dynamic import-like pattern
  // but since we can't, we'll just use a hardcoded fallback
  try {
    // eslint-disable-next-line
    const { useT } = require('@/contexts/LanguageContext');
    return useT();
  } catch {
    return (key: string) => key === 'offline.message' ? 'Estás offline. Algumas funcionalidades podem não funcionar.' : key;
  }
}

export function OfflineBanner() {
  const t = useSafeT();
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-destructive text-destructive-foreground text-center text-xs font-medium overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 py-1.5 px-4">
            <WifiOff className="h-3.5 w-3.5 shrink-0" />
            <span>{t('offline.message')}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

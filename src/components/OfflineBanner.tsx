import { useOnlineStatus } from '@/hooks/use-online-status';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineBanner() {
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
            <span>Estás offline — os dados podem estar desatualizados</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

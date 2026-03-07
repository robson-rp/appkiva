import { useState } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallPWAPrompt() {
  const { isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('pwa-prompt-dismissed') === 'true'
  );

  if (!isInstallable || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border bg-card p-4 shadow-lg"
      >
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Instalar Kivara</p>
            <p className="text-xs text-muted-foreground">Acede mais rápido, mesmo offline!</p>
          </div>
          <Button size="sm" onClick={install}>
            Instalar
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

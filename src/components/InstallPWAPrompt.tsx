import { useState } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '@/contexts/LanguageContext';

const DISMISS_KEY = 'pwa-prompt-dismissed-at';
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return daysSince < DISMISS_DAYS;
}

export function InstallPWAPrompt() {
  const t = useT();
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => isDismissed());

  if (!isInstallable || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
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

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-foreground">{t('pwa.title')}</p>
            <p className="text-xs text-muted-foreground">{t('pwa.subtitle')}</p>

            {isIOS ? (
              <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Share className="h-3.5 w-3.5 text-primary" />
                  {t('pwa.ios_step1')}
                </li>
                <li className="flex items-center gap-1.5">
                  <PlusSquare className="h-3.5 w-3.5 text-primary" />
                  {t('pwa.ios_step2')}
                </li>
              </ol>
            ) : (
              <Button size="sm" onClick={install} className="mt-1">
                {t('pwa.install')}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

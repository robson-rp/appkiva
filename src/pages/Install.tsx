import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, Smartphone, Wifi, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useT } from '@/contexts/LanguageContext';

export default function Install() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const t = useT();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            {isInstalled ? (
              <CheckCircle className="h-8 w-8 text-primary" />
            ) : (
              <Download className="h-8 w-8 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isInstalled ? t('install.installed_title') : t('install.install_title')}
          </h1>
          <p className="text-muted-foreground">
            {isInstalled ? t('install.installed_desc') : t('install.install_desc')}
          </p>
        </div>

        <div className="space-y-3 text-left">
          {[
            { icon: Zap, label: t('install.instant') },
            { icon: Wifi, label: t('install.offline') },
            { icon: Smartphone, label: t('install.native') },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">{label}</span>
            </div>
          ))}
        </div>

        {!isInstalled && (
          <div className="space-y-3">
            {isInstallable ? (
              <Button onClick={install} size="lg" className="w-full">
                <Download className="mr-2 h-4 w-4" /> {t('install.now')}
              </Button>
            ) : (
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">{t('install.how_to')}</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>{t('install.step1')}</li>
                  <li>{t('install.step2')}</li>
                  <li>{t('install.step3')}</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

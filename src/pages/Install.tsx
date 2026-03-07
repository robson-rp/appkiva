import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, Smartphone, Wifi, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Install() {
  const { isInstallable, isInstalled, install } = usePWAInstall();

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
            {isInstalled ? 'Kivara instalada!' : 'Instalar Kivara'}
          </h1>
          <p className="text-muted-foreground">
            {isInstalled
              ? 'A app já está instalada no teu dispositivo.'
              : 'Instala a Kivara para acesso rápido e funcionalidades offline.'}
          </p>
        </div>

        <div className="space-y-3 text-left">
          {[
            { icon: Zap, label: 'Abertura instantânea' },
            { icon: Wifi, label: 'Funciona offline' },
            { icon: Smartphone, label: 'Experiência nativa' },
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
                <Download className="mr-2 h-4 w-4" /> Instalar agora
              </Button>
            ) : (
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Como instalar:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Abre o menu do browser (⋮ ou ⋯)</li>
                  <li>Seleciona "Adicionar ao ecrã inicial"</li>
                  <li>Confirma a instalação</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

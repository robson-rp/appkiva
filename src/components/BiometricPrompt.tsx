import { useEffect, useState } from 'react';
import { useBiometric, BiometricAction } from '@/hooks/use-biometric';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Fingerprint, ShieldCheck } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';

interface BiometricPromptProps {
  action: BiometricAction;
  open: boolean;
  onVerified: () => void;
  onCancel: () => void;
}

export function BiometricPrompt({ action, open, onVerified, onCancel }: BiometricPromptProps) {
  const { verify, biometryType, isAvailable } = useBiometric();
  const t = useT();
  const [verifying, setVerifying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (open && isAvailable) {
      handleVerify();
    }
  }, [open]);

  const handleVerify = async () => {
    setVerifying(true);
    setFailed(false);

    const success = await verify(action);
    setVerifying(false);

    if (success) {
      onVerified();
    } else {
      setFailed(true);
    }
  };

  // If biometric is not available, auto-pass
  if (!isAvailable) {
    if (open) onVerified();
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t('biometric.title')}
          </DialogTitle>
          <DialogDescription>
            {action === 'login' && t('biometric.reason_login')}
            {action === 'transaction' && t('biometric.reason_transaction')}
            {action === 'vault' && t('biometric.reason_vault')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Fingerprint className="h-10 w-10 text-primary" />
          </div>

          <p className="text-sm text-muted-foreground">
            {verifying
              ? t('biometric.verifying')
              : failed
                ? t('biometric.failed')
                : `${t('biometric.use')} ${biometryType}`}
          </p>

          {failed && (
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={onCancel}>
                {t('common.cancel')}
              </Button>
              <Button className="flex-1" onClick={handleVerify}>
                {t('biometric.retry')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

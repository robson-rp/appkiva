import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useBiometric } from '@/hooks/use-biometric';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Fingerprint } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';

interface BiometricLoginPromptProps {
  open: boolean;
  email: string;
  password: string;
  onClose: () => void;
}

/**
 * Shown after successful login to offer saving credentials for biometric login.
 */
export function BiometricSetupPrompt({ open, email, password, onClose }: BiometricLoginPromptProps) {
  const { isAvailable, isEnabled, saveCredentials } = useBiometric();
  const t = useT();

  if (!isAvailable || isEnabled) {
    if (open) onClose();
    return null;
  }

  const handleEnable = async () => {
    await saveCredentials(email, password);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            {t('biometric.setup_title')}
          </DialogTitle>
          <DialogDescription>
            {t('biometric.setup_desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Fingerprint className="h-8 w-8 text-primary" />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleEnable} className="w-full">
            {t('biometric.enable')}
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            {t('biometric.skip')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { isPasswordValid } from '@/lib/password-validation';
import { useT } from '@/contexts/LanguageContext';

export function ChangePasswordSection() {
  const t = useT();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isPasswordValid(newPassword) && passwordsMatch && !saving;

  const handleChangePassword = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast({ title: t('password.reset_success') });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.response?.data?.message || error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold">{t('password.change_title')}</h2>
        </div>

        <div className="space-y-2">
          <Label>{t('password.current_password')}</Label>
          <div className="relative">
            <Input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-xl pr-10"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('password.new_password')}</Label>
          <div className="relative">
            <Input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-xl pr-10"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrengthMeter password={newPassword} />
        </div>

        <div className="space-y-2">
          <Label>{t('password.confirm_password')}</Label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-xl pr-10"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-destructive font-medium">{t('password.mismatch')}</p>
          )}
          {passwordsMatch && (
            <p className="text-xs text-secondary font-medium flex items-center gap-1">
              <Check className="h-3 w-3" /> {t('password.match')}
            </p>
          )}
        </div>

        <Button
          onClick={handleChangePassword}
          disabled={!canSubmit}
          className="w-full rounded-xl font-display h-10 gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          {saving ? t('profile.saving') : t('password.update_password')}
        </Button>
      </CardContent>
    </Card>
  );
}

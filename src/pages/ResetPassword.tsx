import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/contexts/LanguageContext';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { isPasswordValid } from '@/lib/password-validation';
import kivaraLogoWhite from '@/assets/logo-kivara-white.svg';

export default function ResetPassword() {
  const t = useT();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });
    // Also check hash directly
    if (window.location.hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid(password)) {
      toast({ title: t('password.too_weak'), variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
      setSubmitting(false);
      return;
    }
    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => navigate('/login', { replace: true }), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="relative flex flex-col items-center justify-center px-4 py-6 lg:flex-1 lg:p-16 gradient-kivara overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <img src={kivaraLogoWhite} alt="KIVARA" className="h-16 lg:h-48 drop-shadow-lg" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">{t('password.reset_success')}</h2>
              <p className="text-muted-foreground text-sm">{t('password.redirect_login')}</p>
            </div>
          ) : !isRecovery ? (
            <div className="text-center space-y-4">
              <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
              <h2 className="font-display text-xl font-bold text-foreground">{t('password.invalid_link')}</h2>
              <p className="text-muted-foreground text-sm">{t('password.invalid_link_desc')}</p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">{t('password.new_password_title')}</h2>
                <p className="text-muted-foreground text-sm">{t('password.new_password_desc')}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-semibold">{t('password.new_password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl text-base"
                    required
                  />
                  <PasswordStrengthMeter password={password} />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-display font-bold text-base"
                  disabled={submitting || !isPasswordValid(password)}
                >
                  {submitting ? t('common.loading') : t('password.update_password')}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

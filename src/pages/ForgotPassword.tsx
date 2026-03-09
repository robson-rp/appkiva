import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/contexts/LanguageContext';
import kivaraLogoWhite from '@/assets/logo-kivara-white.svg';

export default function ForgotPassword() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSent(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="relative flex flex-col items-center justify-center px-4 py-6 lg:flex-1 lg:p-16 gradient-kivara overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <img src={kivaraLogoWhite} alt="KIVARA" className="h-16 lg:h-48 drop-shadow-lg" />
          <p className="hidden lg:block text-white/60 text-sm tracking-[0.25em] uppercase font-light">
            {t('auth.slogan')}
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
            <ArrowLeft className="h-4 w-4" />
            {t('auth.back')}
          </Link>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">{t('password.reset_sent_title')}</h2>
              <p className="text-muted-foreground text-sm">{t('password.reset_sent_desc')}</p>
              <p className="text-sm font-medium text-foreground">{email}</p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">{t('password.forgot_title')}</h2>
                <p className="text-muted-foreground text-sm">{t('password.forgot_desc')}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl text-base"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-display font-bold text-base" disabled={submitting}>
                  {submitting ? t('common.loading') : t('password.send_reset_link')}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';

export default function JoinFamily() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const t = useT();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');

  useEffect(() => {
    if (!code) { setStatus('invalid'); return; }
    supabase.rpc('validate_invite_code', { _code: code } as any).then(({ data, error }) => {
      if (error || !data || !(data as any).valid) {
        setStatus('invalid');
      } else {
        setStatus('valid');
      }
    });
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Card className="border-border/50 overflow-hidden">
          <div className="h-1 gradient-kivara" />
          <CardContent className="p-8 text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                <p className="font-display font-bold">{t('join.validating')}</p>
              </>
            )}
            {status === 'valid' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-secondary" />
                </div>
                <h2 className="font-display font-bold text-xl">{t('join.valid_title')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('join.valid_desc').replace('{code}', code?.toUpperCase() ?? '')}
                </p>
                <Button className="w-full rounded-xl font-display" onClick={() => navigate(`/login?invite=${code}`)}>
                  {t('join.create_account')}
                </Button>
              </>
            )}
            {status === 'invalid' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="font-display font-bold text-xl">{t('join.invalid_title')}</h2>
                <p className="text-sm text-muted-foreground">{t('join.invalid_desc')}</p>
                <Button variant="outline" className="w-full rounded-xl font-display" onClick={() => navigate('/login')}>
                  {t('join.go_login')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

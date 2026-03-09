import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useValidateProgramInvite, useAcceptProgramInvitation } from '@/hooks/use-program-invitations';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle2, XCircle, Handshake } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useT } from '@/contexts/LanguageContext';

export default function AcceptProgramInvite() {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const [accepted, setAccepted] = useState(false);

  const { data: validation, isLoading } = useValidateProgramInvite(code ?? null);
  const acceptMutation = useAcceptProgramInvitation();

  const handleAccept = async () => {
    if (!code || !user?.profileId) return;
    try {
      const result = await acceptMutation.mutateAsync({ code, profileId: user.profileId });
      if ((result as any)?.success) {
        setAccepted(true);
        toast.success(t('invite.success'));
      } else {
        toast.error((result as any)?.error || t('invite.error'));
      }
    } catch {
      toast.error(t('invite.error'));
    }
  };

  const goHome = () => {
    if (user?.role === 'parent') navigate('/parent');
    else if (user?.role === 'teacher') navigate('/teacher');
    else navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-sm w-full rounded-2xl text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">{t('invite.accepted_title')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('invite.accepted_desc').replace('{name}', validation?.program_name ?? '')}
            </p>
            <Button onClick={goHome} className="rounded-xl w-full">{t('invite.go_panel')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validation?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-sm w-full rounded-2xl text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">{t('invite.invalid_title')}</h2>
            <p className="text-sm text-muted-foreground">{validation?.error || t('invite.invalid_desc')}</p>
            <Button variant="outline" onClick={goHome} className="rounded-xl w-full">{t('invite.back')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-sm w-full rounded-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Handshake className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-display text-xl">{t('invite.program_title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('invite.program_desc')}</p>
            <p className="font-display text-lg font-bold text-foreground">{validation.program_name}</p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline">{validation.partner_name}</Badge>
              <Badge variant="secondary">
                {validation.target_type === 'family' ? t('invite.family') : t('invite.school')}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={goHome} className="flex-1 rounded-xl">{t('invite.decline')}</Button>
            <Button onClick={handleAccept} disabled={acceptMutation.isPending} className="flex-1 rounded-xl gap-1.5">
              {acceptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {t('invite.accept')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

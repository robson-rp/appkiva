import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Users, School, Search, Loader2, Trash2, Crown, Zap } from 'lucide-react';
import { useState } from 'react';
import { usePartnerPrograms, useDeletePartnerProgram } from '@/hooks/use-partner-data';
import { usePartnerLimits } from '@/hooks/use-partner-limits';
import { useAuth } from '@/contexts/AuthContext';
import { ProgramInviteDialog } from '@/components/partner/ProgramInviteDialog';
import { CreateProgramDialog } from '@/components/partner/CreateProgramDialog';
import { EditProgramDialog } from '@/components/partner/EditProgramDialog';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/contexts/LanguageContext';

export default function PartnerPrograms() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const [search, setSearch] = useState('');
  const limits = usePartnerLimits();
  const { data: programs, isLoading } = usePartnerPrograms();
  const deleteProgram = useDeletePartnerProgram();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('partner.programs.delete_confirm').replace('{name}', name))) return;
    try {
      await deleteProgram.mutateAsync(id);
      toast.success(t('partner.programs.deleted'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const filtered = (programs ?? []).filter(p =>
    p.program_name.toLowerCase().includes(search.toLowerCase())
  );

  const schools = filtered.filter(p => p.program_type === 'school');
  const families = filtered.filter(p => p.program_type === 'family');
  const totalChildren = filtered.reduce((sum, p) => sum + p.children_count, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const programPct = limits.maxPrograms >= 99999 ? 5 : (limits.usedPrograms / limits.maxPrograms) * 100;
  const childPct = limits.maxChildren >= 99999 ? 5 : (limits.usedChildren / limits.maxChildren) * 100;
  const nearLimit = programPct >= 80 || childPct >= 80;

  return (
    <div className="space-y-6">
      {/* Consumption Bar */}
      {!limits.loading && (
        <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-display gap-1">
                  <Zap className="h-3 w-3" /> {limits.tierName}
                </Badge>
              </div>
              {nearLimit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1 border-primary/30 text-primary"
                  onClick={() => navigate('/partner/subscription')}
                >
                  <Crown className="h-3 w-3" /> {t('partner.subscription.upgrade')}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{t('partner.subscription.programs')}</span>
                  <span className="font-semibold text-foreground">
                    {limits.usedPrograms}/{limits.maxPrograms >= 99999 ? '∞' : limits.maxPrograms}
                  </span>
                </div>
                <Progress value={programPct} className="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{t('partner.subscription.children')}</span>
                  <span className="font-semibold text-foreground">
                    {limits.usedChildren}/{limits.maxChildren >= 99999 ? '∞' : limits.maxChildren}
                  </span>
                </div>
                <Progress value={childPct} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-heading md:text-heading-lg text-foreground">{t('partner.programs.title')}</h1>
          <p className="text-small text-muted-foreground font-body">{t('partner.programs.subtitle')}</p>
        </div>
        <CreateProgramDialog />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('partner.programs.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(prog => (
          <Card key={prog.id} className="rounded-2xl border-border/50 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  {prog.program_type === 'school' ? (
                    <School className="h-5 w-5 text-chart-3" />
                  ) : (
                    <Users className="h-5 w-5 text-primary" />
                  )}
                </div>
                <Badge variant={prog.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {prog.status === 'active' ? t('partner.programs.status_active') : prog.status === 'pending' ? t('partner.programs.status_pending') : t('partner.programs.status_inactive')}
                </Badge>
              </div>
              <h3 className="font-display font-bold text-foreground">{prog.program_name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {prog.children_count} {t('partner.programs.children')} • {t('partner.programs.since')} {format(new Date(prog.started_at), 'MMM yyyy', { locale: pt })}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {t('partner.programs.budget')}: <span className="font-semibold text-foreground">{Number(prog.investment_amount).toLocaleString()} KVC</span>
                </p>
                {Number(prog.budget_spent) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    • {t('partner.programs.spent')}: <span className="font-semibold text-foreground">{Number(prog.budget_spent).toLocaleString()} KVC</span>
                  </p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                <ProgramInviteDialog
                  programId={prog.id}
                  programName={prog.program_name}
                  partnerTenantId={prog.partner_tenant_id}
                />
                <div className="flex gap-1">
                  <EditProgramDialog program={prog} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                    onClick={() => handleDelete(prog.id, prog.program_name)}
                    disabled={deleteProgram.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-3 text-center py-8">{t('partner.programs.no_programs')}</p>
        )}
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg">{t('partner.programs.summary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-2xl font-bold text-foreground">{schools.length}</p>
              <p className="text-xs text-muted-foreground">{t('partner.programs.schools')}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-foreground">{families.length}</p>
              <p className="text-xs text-muted-foreground">{t('partner.programs.families')}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-foreground">{totalChildren}</p>
              <p className="text-xs text-muted-foreground">{t('partner.programs.total_children')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

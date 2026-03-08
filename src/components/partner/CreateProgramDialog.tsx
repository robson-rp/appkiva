import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreatePartnerProgram } from '@/hooks/use-partner-data';
import { usePartnerLimits } from '@/hooks/use-partner-limits';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Loader2, Users, School, Crown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function CreateProgramDialog() {
  const { user } = useAuth();
  const t = useT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'family' | 'school'>('family');
  const [childrenCount, setChildrenCount] = useState('');
  const [investment, setInvestment] = useState('');

  const createProgram = useCreatePartnerProgram();
  const limits = usePartnerLimits();

  const parsedChildren = childrenCount ? parseInt(childrenCount) : 0;
  const atProgramLimit = !limits.canCreateProgram;
  const atChildrenLimit = !limits.canAddChildren(parsedChildren);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error(t('dialog.program.name_required'));
      return;
    }

    if (atProgramLimit) {
      toast.error(t('dialog.program.limit_reached'));
      return;
    }

    if (atChildrenLimit) {
      toast.error(t('dialog.program.children_limit'));
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('user_id', user!.id)
      .single();

    if (!profile?.tenant_id) {
      toast.error(t('dialog.program.tenant_error'));
      return;
    }

    try {
      await createProgram.mutateAsync({
        partner_tenant_id: profile.tenant_id,
        program_name: name.trim(),
        program_type: type,
        children_count: parsedChildren,
        investment_amount: investment ? parseFloat(investment) : 0,
      });
      toast.success(t('dialog.program.created'));
      setOpen(false);
      setName('');
      setType('family');
      setChildrenCount('');
      setInvestment('');
    } catch {
      toast.error(t('dialog.program.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 rounded-xl" disabled={atProgramLimit}>
          <Plus className="h-4 w-4" />
          {t('dialog.program.new')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">{t('dialog.program.create_title')}</DialogTitle>
        </DialogHeader>

        {atProgramLimit ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground">{t('dialog.program.limit_title')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('dialog.program.limit_desc').replace('{tier}', limits.tierName).replace('{max}', String(limits.maxPrograms))}
              </p>
            </div>
            <Button
              onClick={() => { setOpen(false); navigate('/partner/subscription'); }}
              className="rounded-xl gap-1.5"
            >
              <Crown className="h-4 w-4" /> {t('dialog.program.upgrade')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('dialog.program.name')}</label>
              <Input
                placeholder={t('dialog.program.name_placeholder')}
                value={name}
                onChange={e => setName(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t('dialog.program.type')}</label>
              <Select value={type} onValueChange={v => setType(v as 'family' | 'school')}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {t('dialog.program.type_family')}</span>
                  </SelectItem>
                  <SelectItem value="school">
                    <span className="flex items-center gap-1.5"><School className="h-3.5 w-3.5" /> {t('dialog.program.type_school')}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('dialog.program.children_count')}</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={childrenCount}
                  onChange={e => setChildrenCount(e.target.value)}
                  className="rounded-xl"
                />
                {atChildrenLimit && parsedChildren > 0 && (
                  <p className="text-[10px] text-destructive mt-1">{t('dialog.program.exceeds_limit').replace('{max}', String(limits.maxChildren))}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('dialog.program.budget')}</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={investment}
                  onChange={e => setInvestment(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createProgram.isPending || atChildrenLimit}
              className="w-full rounded-xl gap-1.5"
            >
              {createProgram.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t('dialog.program.create')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

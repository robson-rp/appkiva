import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Loader2, School } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useUpdateChild } from '@/hooks/use-children';
import { useT } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AVATAR_OPTIONS = ['👧', '👦', '🧒', '👶', '🧒🏽', '👧🏾', '👦🏻', '👧🏼', '🧒🏿', '👦🏽', '🦊', '🐱', '🐶', '🦁', '🐼', '🐰'];

interface EditChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child: {
    childId: string;
    profileId: string;
    displayName: string;
    nickname: string | null;
    avatar: string;
    dateOfBirth: string | null;
    schoolTenantId?: string | null;
  } | null;
}

export default function EditChildDialog({ open, onOpenChange, child }: EditChildDialogProps) {
  const t = useT();
  const updateChild = useUpdateChild();
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [schoolTenantId, setSchoolTenantId] = useState<string | null>(null);

  // Fetch school tenants
  const { data: schools = [] } = useQuery({
    queryKey: ['school-tenants'],
    queryFn: async (): Promise<{ id: string; name: string }[]> => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('type', 'school')
        .order('name');
      if (error) throw error;
      return (data as any[])?.map(d => ({ id: d.id, name: d.name })) ?? [];
    },
  });

  const [lastChildId, setLastChildId] = useState<string | null>(null);
  if (child && child.childId !== lastChildId) {
    setLastChildId(child.childId);
    setNickname(child.nickname ?? '');
    setAvatar(child.avatar);
    setDateOfBirth(child.dateOfBirth ? new Date(child.dateOfBirth) : undefined);
    setSchoolTenantId(child.schoolTenantId ?? null);
  }

  const handleSave = async () => {
    if (!child) return;
    try {
      await updateChild.mutateAsync({
        childId: child.childId,
        profileId: child.profileId,
        nickname: nickname.trim() || null,
        avatar,
        dateOfBirth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : null,
        schoolTenantId,
      });
      toast({
        title: t('dialog.edit_child.saved'),
        description: t('dialog.edit_child.saved_desc').replace('{name}', nickname || child.displayName),
      });
      onOpenChange(false);
    } catch {
      toast({ title: t('common.error'), description: t('dialog.edit_child.error'), variant: 'destructive' });
    }
  };

  if (!child) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <span className="text-3xl">{avatar}</span>
            {t('dialog.edit_child.title')}
          </DialogTitle>
          <DialogDescription>{t('dialog.edit_child.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">{t('dialog.edit_child.avatar')}</Label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={cn(
                    'w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all duration-200 border-2',
                    avatar === emoji
                      ? 'border-primary bg-primary/10 scale-110 shadow-md'
                      : 'border-transparent bg-muted/50 hover:bg-muted hover:scale-105'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">{t('dialog.edit_child.nickname')}</Label>
            <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={t('dialog.edit_child.nickname_placeholder')} className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">{t('dialog.edit_child.date_of_birth')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal rounded-xl', !dateOfBirth && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : t('dialog.edit_child.select_date')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={setDateOfBirth}
                  captionLayout="dropdown-buttons"
                  fromYear={2000}
                  toYear={new Date().getFullYear() - 6}
                  disabled={(date) => {
                    const today = new Date();
                    const minAgeDate = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate());
                    return date > minAgeDate || date < new Date('2000-01-01');
                  }}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                  locale={pt}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* School selector */}
          <div className="space-y-2">
            <Label className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <School className="h-3.5 w-3.5" />
              Escola
            </Label>
            <Select value={schoolTenantId ?? 'none'} onValueChange={(v) => setSchoolTenantId(v === 'none' ? null : v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecionar escola" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma escola</SelectItem>
                {schools.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" className="rounded-xl font-display" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button className="rounded-xl font-display gap-1.5" onClick={handleSave} disabled={updateChild.isPending}>
            {updateChild.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('dialog.edit_child.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useUpdateChild } from '@/hooks/use-children';

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
  } | null;
}

export default function EditChildDialog({ open, onOpenChange, child }: EditChildDialogProps) {
  const updateChild = useUpdateChild();
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();

  // Sync state when child changes
  const [lastChildId, setLastChildId] = useState<string | null>(null);
  if (child && child.childId !== lastChildId) {
    setLastChildId(child.childId);
    setNickname(child.nickname ?? '');
    setAvatar(child.avatar);
    setDateOfBirth(child.dateOfBirth ? new Date(child.dateOfBirth) : undefined);
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
      });
      toast({ title: 'Perfil atualizado! ✨', description: `${nickname || child.displayName} foi atualizado com sucesso.` });
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o perfil.', variant: 'destructive' });
    }
  };

  if (!child) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <span className="text-3xl">{avatar}</span>
            Editar Perfil
          </DialogTitle>
          <DialogDescription>Atualiza os dados da criança.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Avatar picker */}
          <div className="space-y-2">
            <Label className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">Avatar</Label>
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

          {/* Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">Alcunha</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: Kika"
              className="rounded-xl"
            />
          </div>

          {/* Date of birth */}
          <div className="space-y-2">
            <Label className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">Data de Nascimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal rounded-xl',
                    !dateOfBirth && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : 'Selecionar data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={setDateOfBirth}
                  captionLayout="dropdown-buttons"
                  fromYear={2000}
                  toYear={new Date().getFullYear()}
                  disabled={(date) => date > new Date() || date < new Date('2000-01-01')}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                  locale={pt}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" className="rounded-xl font-display" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="rounded-xl font-display gap-1.5" onClick={handleSave} disabled={updateChild.isPending}>
            {updateChild.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

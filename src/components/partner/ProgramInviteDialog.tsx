import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateProgramInvitation, useProgramInvitations } from '@/hooks/use-program-invitations';
import { Link2, Copy, Check, Send, Loader2, Users, School } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Props {
  programId: string;
  programName: string;
  partnerTenantId: string;
}

export function ProgramInviteDialog({ programId, programName, partnerTenantId }: Props) {
  const [open, setOpen] = useState(false);
  const [targetType, setTargetType] = useState<'family' | 'school'>('family');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const createInvite = useCreateProgramInvitation();
  const { data: invitations, isLoading } = useProgramInvitations(programId);

  const handleCreate = async () => {
    try {
      await createInvite.mutateAsync({
        program_id: programId,
        partner_tenant_id: partnerTenantId,
        target_type: targetType,
      });
      toast.success('Convite criado com sucesso!');
    } catch {
      toast.error('Erro ao criar convite');
    }
  };

  const copyLink = async (code: string, id: string) => {
    const link = `${window.location.origin}/invite/program/${code}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success('Link copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareLink = async (code: string, programName: string) => {
    const link = `${window.location.origin}/invite/program/${code}`;
    const text = `Convite para o programa "${programName}" na Kivara`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Convite Kivara', text, url: link });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(link);
      toast.success('Link copiado!');
    }
  };

  const activeInvites = (invitations ?? []).filter(i => i.status === 'pending');
  const usedInvites = (invitations ?? []).filter(i => i.status !== 'pending');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
          <Link2 className="h-3.5 w-3.5" />
          Convidar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Convidar para {programName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new invite */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Tipo de destinatário</label>
              <Select value={targetType} onValueChange={v => setTargetType(v as any)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Família</span>
                  </SelectItem>
                  <SelectItem value="school">
                    <span className="flex items-center gap-1.5"><School className="h-3.5 w-3.5" /> Escola</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={createInvite.isPending} className="rounded-xl gap-1.5">
              {createInvite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Gerar Link
            </Button>
          </div>

          {/* Active invites */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : activeInvites.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Convites activos</p>
              {activeInvites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-bold text-foreground tracking-wider">{inv.code}</code>
                      <Badge variant="outline" className="text-[10px]">
                        {inv.target_type === 'family' ? '👨‍👩‍👧 Família' : '🏫 Escola'}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Expira {format(new Date(inv.expires_at), "d MMM yyyy", { locale: pt })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => copyLink(inv.code, inv.id)}
                    >
                      {copiedId === inv.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => shareLink(inv.code, programName)}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-3">Nenhum convite activo. Gere um link para partilhar.</p>
          )}

          {/* Used invites */}
          {usedInvites.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Histórico</p>
              {usedInvites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg opacity-60">
                  <code className="text-xs text-muted-foreground">{inv.code}</code>
                  <Badge variant={inv.status === 'accepted' ? 'default' : 'secondary'} className="text-[10px]">
                    {inv.status === 'accepted' ? 'Aceite' : inv.status === 'rejected' ? 'Recusado' : 'Expirado'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

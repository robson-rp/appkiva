import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Plus, Users, Calendar, Loader2, Pencil, Trash2, ChevronRight, Coins } from 'lucide-react';
import { useSponsoredChallenges, useDeleteSponsoredChallenge, useUpdateSponsoredChallenge, type SponsoredChallenge } from '@/hooks/use-partner-data';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import ChallengeFormDialog from '@/components/partner/ChallengeFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  active: { label: 'Activo', variant: 'default' },
  draft: { label: 'Rascunho', variant: 'secondary' },
  completed: { label: 'Concluído', variant: 'outline' },
};

const statusFlow: Record<string, string[]> = {
  draft: ['active'],
  active: ['completed'],
  completed: [],
};

export default function PartnerChallenges() {
  const { data: challenges, isLoading } = useSponsoredChallenges();
  const deleteChallenge = useDeleteSponsoredChallenge();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<SponsoredChallenge | null>(null);
  const updateChallenge = useUpdateSponsoredChallenge();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function handleEdit(ch: SponsoredChallenge) {
    setEditingChallenge(ch);
    setDialogOpen(true);
  }

  function handleCreate() {
    setEditingChallenge(null);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteChallenge.mutateAsync(deleteId);
      toast.success('Desafio eliminado');
    } catch {
      toast.error('Erro ao eliminar desafio');
    }
    setDeleteId(null);
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateChallenge.mutateAsync({ id, status: newStatus });
      toast.success(`Status alterado para ${statusConfig[newStatus]?.label ?? newStatus}`);
    } catch {
      toast.error('Erro ao alterar status');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-heading md:text-heading-lg text-foreground">Desafios Patrocinados 🏆</h1>
          <p className="text-small text-muted-foreground font-body">Crie e gira desafios para as escolas e famílias do programa</p>
        </div>
        <Button className="rounded-xl gap-2 w-full sm:w-auto" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Novo Desafio
        </Button>
      </div>

      <ChallengeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} challenge={editingChallenge} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar desafio?</AlertDialogTitle>
            <AlertDialogDescription>Esta acção é irreversível. O desafio será permanentemente removido.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        {(challenges ?? []).map(ch => {
          const cfg = statusConfig[ch.status] ?? statusConfig.draft;
          const nextStatuses = statusFlow[ch.status] ?? [];
          return (
            <Card key={ch.id} className="rounded-2xl border-border/50">
              <CardContent className="p-4 sm:p-5">
                {/* Mobile: stack vertically / Desktop: side-by-side */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left block: icon + text */}
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-foreground text-body truncate">{ch.title}</h3>
                        {nextStatuses.length > 0 ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex items-center gap-1 cursor-pointer">
                                <Badge variant={cfg.variant} className="text-caption whitespace-nowrap">
                                  {cfg.label}
                                  <ChevronRight className="h-3 w-3 ml-0.5" />
                                </Badge>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              {nextStatuses.map(ns => (
                                <DropdownMenuItem key={ns} onClick={() => handleStatusChange(ch.id, ns)}>
                                  Mover para {statusConfig[ns]?.label ?? ns}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge variant={cfg.variant} className="text-caption whitespace-nowrap">
                            {cfg.label}
                          </Badge>
                        )}
                      </div>
                      {ch.description && (
                        <p className="text-small text-muted-foreground line-clamp-2">{ch.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-caption text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5" />
                          {ch.reward_amount} KVC
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {ch.participants_count} participantes
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(ch.start_date), 'dd MMM', { locale: pt })} — {format(new Date(ch.end_date), 'dd MMM yyyy', { locale: pt })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right block: completion rate + actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 border-border/30 pt-3 sm:pt-0">
                    {ch.status !== 'draft' && (
                      <div className="sm:text-right mr-1">
                        <p className="font-display text-xl sm:text-2xl font-bold text-foreground">{Number(ch.completion_rate)}%</p>
                        <p className="text-caption text-muted-foreground">conclusão</p>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleEdit(ch)} aria-label="Editar desafio">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:text-destructive" onClick={() => setDeleteId(ch.id)} aria-label="Eliminar desafio">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(!challenges || challenges.length === 0) && (
          <Card className="rounded-2xl border-border/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-small text-muted-foreground">Nenhum desafio criado</p>
              <Button variant="outline" size="sm" className="mt-4 rounded-xl gap-2" onClick={handleCreate}>
                <Plus className="h-4 w-4" />
                Criar primeiro desafio
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

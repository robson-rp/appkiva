import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdatePartnerProgram, type PartnerProgram } from '@/hooks/use-partner-data';
import { Pencil, Loader2, Users, School } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  program: PartnerProgram;
}

export function EditProgramDialog({ program }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(program.program_name);
  const [type, setType] = useState(program.program_type);
  const [childrenCount, setChildrenCount] = useState(String(program.children_count));
  const [investment, setInvestment] = useState(String(program.investment_amount));
  const [status, setStatus] = useState(program.status);

  const updateProgram = useUpdatePartnerProgram();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Introduza o nome do programa');
      return;
    }

    try {
      await updateProgram.mutateAsync({
        id: program.id,
        program_name: name.trim(),
        program_type: type,
        children_count: parseInt(childrenCount) || 0,
        investment_amount: parseFloat(investment) || 0,
        status,
      });
      toast.success('Programa actualizado!');
      setOpen(false);
    } catch {
      toast.error('Erro ao actualizar programa');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Editar Programa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nome do programa</label>
            <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
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
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Estado</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nº de crianças</label>
              <Input type="number" min="0" value={childrenCount} onChange={e => setChildrenCount(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Investimento (€)</label>
              <Input type="number" min="0" step="0.01" value={investment} onChange={e => setInvestment(e.target.value)} className="rounded-xl" />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={updateProgram.isPending} className="w-full rounded-xl">
            {updateProgram.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

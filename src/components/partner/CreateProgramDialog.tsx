import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreatePartnerProgram } from '@/hooks/use-partner-data';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Loader2, Users, School } from 'lucide-react';
import { toast } from 'sonner';

export function CreateProgramDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'family' | 'school'>('family');
  const [childrenCount, setChildrenCount] = useState('');
  const [investment, setInvestment] = useState('');

  const createProgram = useCreatePartnerProgram();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Introduza o nome do programa');
      return;
    }

    // Fetch tenant_id from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('user_id', user!.id)
      .single();

    if (!profile?.tenant_id) {
      toast.error('Tenant não encontrado');
      return;
    }

    try {
      await createProgram.mutateAsync({
        partner_tenant_id: profile.tenant_id,
        program_name: name.trim(),
        program_type: type,
        children_count: childrenCount ? parseInt(childrenCount) : 0,
        investment_amount: investment ? parseFloat(investment) : 0,
      });
      toast.success('Programa criado com sucesso!');
      setOpen(false);
      setName('');
      setType('family');
      setChildrenCount('');
      setInvestment('');
    } catch {
      toast.error('Erro ao criar programa');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 rounded-xl">
          <Plus className="h-4 w-4" />
          Novo Programa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Criar Novo Programa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nome do programa</label>
            <Input
              placeholder="Ex: Literacia Financeira 2026"
              value={name}
              onChange={e => setName(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
            <Select value={type} onValueChange={v => setType(v as 'family' | 'school')}>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nº de crianças</label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={childrenCount}
                onChange={e => setChildrenCount(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Investimento (€)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={investment}
                onChange={e => setInvestment(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createProgram.isPending}
            className="w-full rounded-xl gap-1.5"
          >
            {createProgram.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Criar Programa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

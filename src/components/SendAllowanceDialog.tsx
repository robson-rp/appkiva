import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createTransaction } from '@/lib/ledger-api';
import { useQueryClient } from '@tanstack/react-query';
import type { ChildWithBalance } from '@/hooks/use-children';

interface SendAllowanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ChildWithBalance[];
}

export function SendAllowanceDialog({ open, onOpenChange, children }: SendAllowanceDialogProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Mesada semanal');
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();

  const selectedChild = children.find(c => c.profileId === selectedChildId);

  const handleSend = async () => {
    if (!selectedChildId || !amount || Number(amount) <= 0) {
      toast({ title: 'Erro', description: 'Selecciona uma criança e um montante válido.', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const result = await createTransaction({
        entry_type: 'allowance',
        amount: Number(amount),
        description: description || 'Mesada',
        target_profile_id: selectedChildId,
      });

      toast({
        title: 'Mesada enviada! 💰',
        description: `${selectedChild?.displayName} recebeu ${amount} KivaCoins. Novo saldo: ${result.new_balance} KVC.`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });

      // Reset form
      setAmount('');
      setDescription('Mesada semanal');
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erro ao enviar mesada', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--kivara-light-gold))] flex items-center justify-center">
              <Send className="h-5 w-5 text-accent-foreground" />
            </div>
            Enviar Mesada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label className="text-sm font-display font-bold">Criança</Label>
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecciona uma criança" />
              </SelectTrigger>
              <SelectContent>
                {children.map(child => (
                  <SelectItem key={child.profileId} value={child.profileId}>
                    <span className="flex items-center gap-2">
                      <span>{child.avatar}</span>
                      <span>{child.displayName}</span>
                      <span className="text-muted-foreground text-xs">({child.balance} KVC)</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-display font-bold">Montante (KVC)</Label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Ex: 50"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-display font-bold">Descrição</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Mesada semanal"
              className="rounded-xl"
            />
          </div>

          {selectedChild && amount && Number(amount) > 0 && (
            <div className="bg-muted/30 rounded-2xl p-4 border border-border/30 space-y-1">
              <p className="text-xs text-muted-foreground">Resumo</p>
              <p className="text-sm font-display font-bold">
                {selectedChild.avatar} {selectedChild.displayName} receberá <span className="text-secondary">+{amount} KVC</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Saldo actual: {selectedChild.balance} KVC → Novo saldo: {selectedChild.balance + Number(amount)} KVC
              </p>
            </div>
          )}

          <Button
            className="w-full rounded-xl font-display gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={handleSend}
            disabled={sending || !selectedChildId || !amount || Number(amount) <= 0}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? 'A enviar...' : 'Confirmar Envio'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateSponsoredChallenge, useUpdateSponsoredChallenge, type SponsoredChallenge } from '@/hooks/use-partner-data';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().trim().min(3, 'Mínimo 3 caracteres').max(100),
  description: z.string().trim().max(500).optional(),
  reward_amount: z.coerce.number().min(0, 'Mínimo 0 KVC'),
  start_date: z.date({ required_error: 'Data de início obrigatória' }),
  end_date: z.date({ required_error: 'Data de fim obrigatória' }),
}).refine(d => d.end_date > d.start_date, {
  message: 'Data de fim deve ser posterior à de início',
  path: ['end_date'],
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge?: SponsoredChallenge | null;
}

export default function ChallengeFormDialog({ open, onOpenChange, challenge }: Props) {
  const { user } = useAuth();
  const createChallenge = useCreateSponsoredChallenge();
  const updateChallenge = useUpdateSponsoredChallenge();
  const [loading, setLoading] = useState(false);
  const isEdit = !!challenge;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', reward_amount: 0 },
  });

  useEffect(() => {
    if (open && challenge) {
      form.reset({
        title: challenge.title,
        description: challenge.description ?? '',
        reward_amount: challenge.reward_amount ?? 0,
        start_date: new Date(challenge.start_date),
        end_date: new Date(challenge.end_date),
      });
    } else if (open) {
      form.reset({ title: '', description: '', reward_amount: 0 });
    }
  }, [open, challenge]);

  async function onSubmit(values: FormValues) {
    if (!user) return;
    setLoading(true);

    try {
      if (isEdit) {
        await updateChallenge.mutateAsync({
          id: challenge!.id,
          title: values.title,
          description: values.description || null,
          reward_amount: values.reward_amount,
          start_date: format(values.start_date, 'yyyy-MM-dd'),
          end_date: format(values.end_date, 'yyyy-MM-dd'),
        });
        toast.success('Desafio actualizado!');
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('user_id', user.id)
          .single();

        if (!profile?.tenant_id) {
          toast.error('Conta de parceiro sem organização associada');
          setLoading(false);
          return;
        }

        await createChallenge.mutateAsync({
          partner_tenant_id: profile.tenant_id,
          title: values.title,
          description: values.description || null,
          start_date: format(values.start_date, 'yyyy-MM-dd'),
          end_date: format(values.end_date, 'yyyy-MM-dd'),
          status: 'draft',
        });
        toast.success('Desafio criado com sucesso!');
      }

      form.reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao guardar desafio');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">{isEdit ? 'Editar Desafio' : 'Novo Desafio Patrocinado'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Altere os dados do desafio.' : 'Preencha os dados do desafio. Será criado como rascunho.'}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl><Input placeholder="Ex: Desafio Poupança de Natal" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (opcional)</FormLabel>
                <FormControl><Textarea placeholder="Descreva o objectivo do desafio..." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="start_date" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Início</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                          {field.value ? format(field.value, 'dd MMM yyyy', { locale: pt }) : 'Seleccionar'}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="end_date" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fim</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                          {field.value ? format(field.value, 'dd MMM yyyy', { locale: pt }) : 'Seleccionar'}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isEdit ? 'Guardar' : 'Criar Desafio'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

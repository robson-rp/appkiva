import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function AdminRisk() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [scanning, setScanning] = useState(false);

  const { data: flags, isLoading } = useQuery({
    queryKey: ['risk-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_flags')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const runScan = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('risk-scan');
      if (error) throw error;
      toast({ title: 'Scan concluído', description: `${data?.flags_created ?? 0} novas flags criadas` });
      qc.invalidateQueries({ queryKey: ['risk-flags'] });
    } catch (e: any) {
      toast({ title: 'Erro no scan', description: e.message, variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  const resolveFlag = useMutation({
    mutationFn: async (flagId: string) => {
      const { error } = await supabase
        .from('risk_flags')
        .update({ resolved_at: new Date().toISOString(), resolution_notes: 'Resolvido pelo admin' } as any)
        .eq('id', flagId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['risk-flags'] });
      toast({ title: 'Flag resolvida' });
    },
  });

  const openFlags = flags?.filter(f => !f.resolved_at) ?? [];
  const resolvedFlags = flags?.filter(f => f.resolved_at) ?? [];

  const severityColors: Record<string, string> = {
    critical: 'bg-destructive text-destructive-foreground',
    high: 'bg-destructive/80 text-destructive-foreground',
    medium: 'bg-accent text-accent-foreground',
    low: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Monitorização de Risco</h1>
          <p className="text-sm text-muted-foreground">Detecção de anomalias e fraude na plataforma</p>
        </div>
        <Button onClick={runScan} disabled={scanning}>
          <RefreshCw className={`h-4 w-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'A analisar...' : 'Executar Scan'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Flags Abertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">{openFlags.length}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolvidas</CardTitle>
              <Shield className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">{resolvedFlags.length}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">{flags?.length ?? 0}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display">Flags Activas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">A carregar...</p>
          ) : !openFlags.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma flag aberta. ✅</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openFlags.map((flag: any) => (
                  <TableRow key={flag.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(flag.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{flag.flag_type}</TableCell>
                    <TableCell>
                      <Badge className={severityColors[flag.severity] ?? ''}>
                        {flag.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate">{flag.description}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => resolveFlag.mutate(flag.id)}>
                        Resolver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

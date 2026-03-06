import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function AdminAudit() {
  const [resourceFilter, setResourceFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-log', resourceFilter, actionFilter],
    queryFn: async () => {
      let query = supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (resourceFilter !== 'all') {
        query = query.eq('resource_type', resourceFilter);
      }
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const actionColors: Record<string, string> = {
    insert: 'bg-secondary/20 text-secondary',
    update: 'bg-primary/20 text-primary',
    delete: 'bg-destructive/20 text-destructive',
    wallet_transfer: 'bg-accent/20 text-accent-foreground',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Registo de Auditoria</h1>
        <p className="text-sm text-muted-foreground">Histórico de acções sensíveis na plataforma</p>
      </div>

      <div className="flex gap-3">
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Recurso" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os recursos</SelectItem>
            <SelectItem value="ledger_entries">Ledger</SelectItem>
            <SelectItem value="wallets">Wallets</SelectItem>
            <SelectItem value="profiles">Perfis</SelectItem>
            <SelectItem value="consent_records">Consentimento</SelectItem>
            <SelectItem value="user_roles">Roles</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Acção" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as acções</SelectItem>
            <SelectItem value="insert">Insert</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            Registos ({logs?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">A carregar...</p>
          ) : !logs?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum registo de auditoria encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Acção</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>ID Recurso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <Badge className={actionColors[log.action] ?? 'bg-muted text-muted-foreground'} variant="secondary">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.resource_type}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[120px] truncate">{log.resource_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

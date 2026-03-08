import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useT } from '@/contexts/LanguageContext';

export default function AdminAudit() {
  const t = useT();
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
        <h1 className="text-2xl font-display font-bold text-foreground">{t('admin.audit.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.audit.subtitle')}</p>
      </div>

      <div className="flex gap-3">
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('admin.audit.resource')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.audit.all_resources')}</SelectItem>
            <SelectItem value="ledger_entries">{t('admin.audit.ledger')}</SelectItem>
            <SelectItem value="wallets">{t('admin.audit.wallets')}</SelectItem>
            <SelectItem value="profiles">{t('admin.audit.profiles')}</SelectItem>
            <SelectItem value="consent_records">{t('admin.audit.consent')}</SelectItem>
            <SelectItem value="user_roles">{t('admin.audit.roles')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('admin.audit.action')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.audit.all_actions')}</SelectItem>
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
            {t('admin.audit.records')} ({logs?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{t('admin.audit.loading')}</p>
          ) : !logs?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{t('admin.audit.empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.audit.date')}</TableHead>
                    <TableHead>{t('admin.audit.action')}</TableHead>
                    <TableHead>{t('admin.audit.resource')}</TableHead>
                    <TableHead>{t('admin.audit.resource_id')}</TableHead>
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

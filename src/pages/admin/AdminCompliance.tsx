import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, FileDown, Trash2, Eye, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useT } from '@/contexts/LanguageContext';

export default function AdminCompliance() {
  const t = useT();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; record: any }>({ open: false, record: null });

  const { data: consents, isLoading } = useQuery({
    queryKey: ['consent-records', statusFilter],
    queryFn: async () => {
      let query = supabase.from('consent_records').select('*, adult:profiles!consent_records_adult_profile_id_fkey(display_name), child:profiles!consent_records_child_profile_id_fkey(display_name)').order('granted_at', { ascending: false }).limit(200);
      if (statusFilter === 'active') query = query.is('revoked_at', null);
      else if (statusFilter === 'revoked') query = query.not('revoked_at', 'is', null);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: auditStats } = useQuery({
    queryKey: ['compliance-stats'],
    queryFn: async () => {
      const [consentCount, auditCount] = await Promise.all([
        supabase.from('consent_records').select('id', { count: 'exact', head: true }),
        supabase.from('audit_log').select('id', { count: 'exact', head: true }),
      ]);
      return { totalConsents: consentCount.count ?? 0, totalAuditRecords: auditCount.count ?? 0 };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{t('admin.compliance.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.compliance.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50"><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-display font-bold text-foreground">{auditStats?.totalConsents ?? '—'}</p><p className="text-xs text-muted-foreground">{t('admin.compliance.consent_records')}</p></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-secondary/10"><FileDown className="h-5 w-5 text-secondary" /></div><div><p className="text-2xl font-display font-bold text-foreground">{auditStats?.totalAuditRecords ?? '—'}</p><p className="text-xs text-muted-foreground">{t('admin.compliance.audit_records')}</p></div></div></CardContent></Card>
        <Card className="border-border/50"><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-accent/10"><CheckCircle2 className="h-5 w-5 text-accent-foreground" /></div><div><p className="text-2xl font-display font-bold text-foreground">RGPD</p><p className="text-xs text-muted-foreground">{t('admin.compliance.framework')}</p></div></div></CardContent></Card>
      </div>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2"><Shield className="h-4 w-4" />{t('admin.compliance.consent_list')} ({consents?.length ?? 0})</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.compliance.all')}</SelectItem>
              <SelectItem value="active">{t('admin.compliance.active')}</SelectItem>
              <SelectItem value="revoked">{t('admin.compliance.revoked')}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{t('admin.compliance.loading')}</p>
          ) : !consents?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{t('admin.compliance.empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.compliance.date')}</TableHead>
                    <TableHead>{t('admin.compliance.guardian')}</TableHead>
                    <TableHead>{t('admin.compliance.child')}</TableHead>
                    <TableHead>{t('admin.compliance.type')}</TableHead>
                    <TableHead>{t('admin.compliance.status')}</TableHead>
                    <TableHead className="text-right">{t('admin.compliance.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consents.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(c.granted_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell className="text-sm">{c.adult?.display_name ?? '—'}</TableCell>
                      <TableCell className="text-sm">{c.child?.display_name ?? '—'}</TableCell>
                      <TableCell><Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">{c.consent_type}</Badge></TableCell>
                      <TableCell>
                        {c.revoked_at ? <Badge variant="destructive" className="text-xs">{t('admin.compliance.status_revoked')}</Badge> : <Badge className="bg-secondary/20 text-secondary text-xs">{t('admin.compliance.status_active')}</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailDialog({ open: true, record: c })}><Eye className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base font-display">{t('admin.compliance.data_mgmt')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
            <FileDown className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1"><p className="text-sm font-medium text-foreground">{t('admin.compliance.export_title')}</p><p className="text-xs text-muted-foreground mt-1">{t('admin.compliance.export_desc')}</p></div>
            <Badge variant="secondary" className="text-xs">{t('admin.compliance.export_badge')}</Badge>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
            <Trash2 className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1"><p className="text-sm font-medium text-foreground">{t('admin.compliance.anon_title')}</p><p className="text-xs text-muted-foreground mt-1">{t('admin.compliance.anon_desc')}</p></div>
            <Badge variant="outline" className="text-xs text-destructive border-destructive/30">{t('admin.compliance.anon_badge')}</Badge>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
            <Shield className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
            <div className="flex-1"><p className="text-sm font-medium text-foreground">{t('admin.compliance.retention_title')}</p><p className="text-xs text-muted-foreground mt-1">{t('admin.compliance.retention_desc')}</p></div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailDialog.open} onOpenChange={(o) => !o && setDetailDialog({ open: false, record: null })}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{t('admin.compliance.detail_title')}</DialogTitle></DialogHeader>
          {detailDialog.record && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-muted-foreground text-xs">{t('admin.compliance.detail_guardian')}</p><p className="font-medium">{detailDialog.record.adult?.display_name ?? '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">{t('admin.compliance.detail_child')}</p><p className="font-medium">{detailDialog.record.child?.display_name ?? '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">{t('admin.compliance.detail_type')}</p><p className="font-medium">{detailDialog.record.consent_type}</p></div>
                <div><p className="text-muted-foreground text-xs">{t('admin.compliance.detail_granted')}</p><p className="font-medium">{format(new Date(detailDialog.record.granted_at), 'dd/MM/yyyy HH:mm:ss')}</p></div>
                {detailDialog.record.revoked_at && (<>
                  <div><p className="text-muted-foreground text-xs">{t('admin.compliance.detail_revoked_at')}</p><p className="font-medium text-destructive">{format(new Date(detailDialog.record.revoked_at), 'dd/MM/yyyy HH:mm:ss')}</p></div>
                  <div><p className="text-muted-foreground text-xs">{t('admin.compliance.detail_reason')}</p><p className="font-medium">{detailDialog.record.revocation_reason ?? '—'}</p></div>
                </>)}
              </div>
              {detailDialog.record.metadata && Object.keys(detailDialog.record.metadata).length > 0 && (<div><p className="text-muted-foreground text-xs mb-1">{t('admin.compliance.detail_metadata')}</p><pre className="text-xs bg-muted rounded-lg p-2 overflow-auto max-h-32">{JSON.stringify(detailDialog.record.metadata, null, 2)}</pre></div>)}
              {detailDialog.record.ip_metadata && Object.keys(detailDialog.record.ip_metadata).length > 0 && (<div><p className="text-muted-foreground text-xs mb-1">{t('admin.compliance.detail_ip')}</p><pre className="text-xs bg-muted rounded-lg p-2 overflow-auto max-h-32">{JSON.stringify(detailDialog.record.ip_metadata, null, 2)}</pre></div>)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Shield, FileDown, Trash2, Eye, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminCompliance() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; id: string; childName: string }>({ open: false, id: '', childName: '' });
  const [revokeReason, setRevokeReason] = useState('');
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; record: any }>({ open: false, record: null });

  const { data: consents, isLoading } = useQuery({
    queryKey: ['consent-records', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('consent_records')
        .select('*, adult:profiles!consent_records_adult_profile_id_fkey(display_name), child:profiles!consent_records_child_profile_id_fkey(display_name)')
        .order('granted_at', { ascending: false })
        .limit(200);

      if (statusFilter === 'active') {
        query = query.is('revoked_at', null);
      } else if (statusFilter === 'revoked') {
        query = query.not('revoked_at', 'is', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      // consent_records has no UPDATE RLS for normal users; admin should be able via has_role
      // We need to use an approach that works — since consent_records doesn't allow UPDATE,
      // we insert a new audit record and mark via a security definer approach.
      // For now, the admin can see the records. Revocation would typically be done by parents.
      // Let's note this limitation.
      toast.info('A revogação de consentimento deve ser solicitada pelo encarregado através do seu painel.');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consent-records'] });
      setRevokeDialog({ open: false, id: '', childName: '' });
      setRevokeReason('');
    },
  });

  const { data: auditStats } = useQuery({
    queryKey: ['compliance-stats'],
    queryFn: async () => {
      const [consentCount, auditCount] = await Promise.all([
        supabase.from('consent_records').select('id', { count: 'exact', head: true }),
        supabase.from('audit_log').select('id', { count: 'exact', head: true }),
      ]);
      return {
        totalConsents: consentCount.count ?? 0,
        totalAuditRecords: auditCount.count ?? 0,
        activeConsents: 0, // would need a filtered count
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Compliance</h1>
        <p className="text-sm text-muted-foreground">Gestão de consentimento, exportação e eliminação de dados</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{auditStats?.totalConsents ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Registos de consentimento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10">
                <FileDown className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{auditStats?.totalAuditRecords ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Registos de auditoria</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/10">
                <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">RGPD</p>
                <p className="text-xs text-muted-foreground">Framework de conformidade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consent Records */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Registos de Consentimento ({consents?.length ?? 0})
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="revoked">Revogados</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">A carregar...</p>
          ) : !consents?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum registo de consentimento encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Encarregado</TableHead>
                    <TableHead>Criança</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consents.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(c.granted_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-sm">{c.adult?.display_name ?? '—'}</TableCell>
                      <TableCell className="text-sm">{c.child?.display_name ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                          {c.consent_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {c.revoked_at ? (
                          <Badge variant="destructive" className="text-xs">Revogado</Badge>
                        ) : (
                          <Badge className="bg-secondary/20 text-secondary text-xs">Activo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setDetailDialog({ open: true, record: c })}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display">Gestão de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
            <FileDown className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Exportação de Dados</p>
              <p className="text-xs text-muted-foreground mt-1">
                Exportar todos os dados de um utilizador em formato JSON conforme o direito de portabilidade (RGPD Art. 20).
                Os encarregados podem exportar os dados dos filhos no painel de Consentimento.
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">Via Encarregado</Badge>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
            <Trash2 className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Anonimização de Dados</p>
              <p className="text-xs text-muted-foreground mt-1">
                A anonimização remove dados pessoais (nome, telefone, data de nascimento) mas mantém registos financeiros no ledger para integridade contabilística (RGPD Art. 17).
                Os encarregados podem solicitar a anonimização dos dados dos filhos.
              </p>
            </div>
            <Badge variant="outline" className="text-xs text-destructive border-destructive/30">Via Encarregado</Badge>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
            <Shield className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Política de Retenção</p>
              <p className="text-xs text-muted-foreground mt-1">
                Dados de actividade são mantidos por 24 meses. Registos financeiros (ledger) são mantidos indefinidamente para conformidade contabilística. Logs de auditoria: 5 anos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(o) => !o && setDetailDialog({ open: false, record: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Detalhe do Consentimento</DialogTitle>
          </DialogHeader>
          {detailDialog.record && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">Encarregado</p>
                  <p className="font-medium">{detailDialog.record.adult?.display_name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Criança</p>
                  <p className="font-medium">{detailDialog.record.child?.display_name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Tipo</p>
                  <p className="font-medium">{detailDialog.record.consent_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Concedido em</p>
                  <p className="font-medium">{format(new Date(detailDialog.record.granted_at), 'dd/MM/yyyy HH:mm:ss')}</p>
                </div>
                {detailDialog.record.revoked_at && (
                  <>
                    <div>
                      <p className="text-muted-foreground text-xs">Revogado em</p>
                      <p className="font-medium text-destructive">{format(new Date(detailDialog.record.revoked_at), 'dd/MM/yyyy HH:mm:ss')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Motivo</p>
                      <p className="font-medium">{detailDialog.record.revocation_reason ?? '—'}</p>
                    </div>
                  </>
                )}
              </div>
              {detailDialog.record.metadata && Object.keys(detailDialog.record.metadata).length > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Metadados</p>
                  <pre className="text-xs bg-muted rounded-lg p-2 overflow-auto max-h-32">
                    {JSON.stringify(detailDialog.record.metadata, null, 2)}
                  </pre>
                </div>
              )}
              {detailDialog.record.ip_metadata && Object.keys(detailDialog.record.ip_metadata).length > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">IP / Dispositivo</p>
                  <pre className="text-xs bg-muted rounded-lg p-2 overflow-auto max-h-32">
                    {JSON.stringify(detailDialog.record.ip_metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, ShieldOff, FileDown, Trash2, AlertTriangle, Eye, Plus } from 'lucide-react';
import { format } from 'date-fns';

const CONSENT_TYPES = [
  { key: 'platform_usage', label: 'Utilização da Plataforma', desc: 'Permite que a criança utilize todas as funcionalidades da KIVARA.' },
  { key: 'data_collection', label: 'Recolha de Dados', desc: 'Autoriza a recolha de dados de actividade para relatórios e gamificação.' },
  { key: 'financial_education', label: 'Educação Financeira', desc: 'Permite que a criança participe em desafios e lições de educação financeira.' },
  { key: 'teacher_access', label: 'Acesso do Professor', desc: 'Permite que professores da escola associada vejam o progresso da criança.' },
];

export default function ParentConsent() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; id: string; childName: string; type: string }>({ open: false, id: '', childName: '', type: '' });
  const [revokeReason, setRevokeReason] = useState('');
  const [grantDialog, setGrantDialog] = useState<{ open: boolean; childId: string; childName: string }>({ open: false, childId: '', childName: '' });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; record: any }>({ open: false, record: null });
  const [exportingChild, setExportingChild] = useState<string | null>(null);

  // Fetch children profiles
  const { data: children = [] } = useQuery({
    queryKey: ['parent-children-profiles', user?.profileId],
    enabled: !!user?.profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('id, profile_id, nickname, profile:profiles!children_profile_id_fkey(id, display_name, avatar)')
        .eq('parent_profile_id', user!.profileId);
      if (error) throw error;
      return data;
    },
  });

  // Fetch consent records
  const { data: consents = [], isLoading } = useQuery({
    queryKey: ['parent-consent-records', user?.profileId],
    enabled: !!user?.profileId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consent_records')
        .select('*, child:profiles!consent_records_child_profile_id_fkey(display_name, avatar)')
        .eq('adult_profile_id', user!.profileId)
        .order('granted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const grantMutation = useMutation({
    mutationFn: async ({ childProfileId, consentType }: { childProfileId: string; consentType: string }) => {
      const { error } = await supabase.from('consent_records').insert({
        adult_profile_id: user!.profileId,
        child_profile_id: childProfileId,
        consent_type: consentType,
        metadata: { granted_via: 'parent_consent_panel', user_agent: navigator.userAgent },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent-consent-records'] });
      toast({ title: 'Consentimento concedido ✅' });
    },
    onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('consent_records')
        .update({ revoked_at: new Date().toISOString(), revocation_reason: reason })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent-consent-records'] });
      setRevokeDialog({ open: false, id: '', childName: '', type: '' });
      setRevokeReason('');
      toast({ title: 'Consentimento revogado ✅' });
    },
    onError: (err: any) => toast({ title: 'Erro', description: err.message, variant: 'destructive' }),
  });

  const handleExportData = async (childProfileId: string) => {
    setExportingChild(childProfileId);
    try {
      const { data, error } = await supabase.functions.invoke('export-user-data', {
        body: { profile_id: childProfileId },
      });
      if (error) throw error;

      // Download as JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kivara-data-${childProfileId.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Dados exportados ✅' });
    } catch (err: any) {
      toast({ title: 'Erro na exportação', description: err.message, variant: 'destructive' });
    } finally {
      setExportingChild(null);
    }
  };

  const activeConsents = consents.filter((c: any) => !c.revoked_at);
  const revokedConsents = consents.filter((c: any) => c.revoked_at);

  // Group by child
  const childMap = new Map<string, { name: string; avatar: string; profileId: string; consents: any[] }>();
  for (const c of children) {
    const profile = c.profile as any;
    if (profile) {
      childMap.set(profile.id, {
        name: profile.display_name,
        avatar: profile.avatar || '🦊',
        profileId: profile.id,
        consents: consents.filter((con: any) => con.child_profile_id === profile.id && !con.revoked_at),
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <CardContent className="p-6 relative z-10">
            <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">Privacidade & Consentimento</p>
            <h1 className="font-display text-2xl font-bold mt-1">Gestão de Consentimento</h1>
            <p className="text-sm text-primary-foreground/70 mt-1">Controla as autorizações dos teus filhos na plataforma</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-display font-bold text-lg">{activeConsents.length}</span>
                <span className="text-xs text-primary-foreground/60">activos</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <ShieldOff className="h-4 w-4" />
                <span className="font-display font-bold text-lg">{revokedConsents.length}</span>
                <span className="text-xs text-primary-foreground/60">revogados</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Per-child consent cards */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2].map(i => (
            <Card key={i}><CardContent className="p-5 space-y-3"><Skeleton className="h-6 w-40" /><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : children.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="font-display font-bold text-lg mb-2">Sem crianças registadas</h3>
            <p className="text-sm text-muted-foreground">Adiciona crianças para gerir os seus consentimentos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Array.from(childMap.entries()).map(([profileId, child]) => (
            <motion.div key={profileId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                        {child.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-base font-display">{child.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{child.consents.length} consentimento(s) activo(s)</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs gap-1.5"
                        onClick={() => setGrantDialog({ open: true, childId: profileId, childName: child.name })}
                      >
                        <Plus className="h-3.5 w-3.5" /> Conceder
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs gap-1.5"
                        disabled={exportingChild === profileId}
                        onClick={() => handleExportData(profileId)}
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        {exportingChild === profileId ? 'A exportar...' : 'Exportar Dados'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {CONSENT_TYPES.map(ct => {
                    const existing = child.consents.find((c: any) => c.consent_type === ct.key);
                    return (
                      <div key={ct.key} className={`flex items-center justify-between gap-3 p-3 rounded-xl ${existing ? 'bg-secondary/5' : 'bg-muted/30'}`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {existing ? (
                            <ShieldCheck className="h-4 w-4 text-secondary shrink-0" />
                          ) : (
                            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{ct.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{ct.desc}</p>
                          </div>
                        </div>
                        {existing ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className="bg-secondary/20 text-secondary text-[10px]">
                              {format(new Date(existing.granted_at), 'dd/MM/yy')}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setRevokeDialog({ open: true, id: existing.id, childName: child.name, type: ct.label })}
                            >
                              <ShieldOff className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">Não concedido</Badge>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Revocation history */}
      {revokedConsents.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-display flex items-center gap-2 text-muted-foreground">
              <ShieldOff className="h-4 w-4" /> Histórico de Revogações ({revokedConsents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {revokedConsents.slice(0, 10).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 text-sm">
                <div className="flex items-center gap-2">
                  <span>{c.child?.avatar || '👤'}</span>
                  <span className="font-medium">{c.child?.display_name}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground text-xs">{c.consent_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{format(new Date(c.revoked_at), 'dd/MM/yy')}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDetailDialog({ open: true, record: c })}>
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Grant Consent Dialog */}
      <Dialog open={grantDialog.open} onOpenChange={(o) => !o && setGrantDialog({ open: false, childId: '', childName: '' })}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-secondary" /> Conceder Consentimento
            </DialogTitle>
            <DialogDescription>Seleciona o tipo de consentimento para {grantDialog.childName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {CONSENT_TYPES.map(ct => {
              const alreadyGranted = consents.some((c: any) =>
                c.child_profile_id === grantDialog.childId && c.consent_type === ct.key && !c.revoked_at
              );
              return (
                <Button
                  key={ct.key}
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 rounded-xl text-left"
                  disabled={alreadyGranted || grantMutation.isPending}
                  onClick={() => {
                    grantMutation.mutate({ childProfileId: grantDialog.childId, consentType: ct.key });
                    setGrantDialog({ open: false, childId: '', childName: '' });
                  }}
                >
                  {alreadyGranted ? <ShieldCheck className="h-4 w-4 text-secondary shrink-0" /> : <Shield className="h-4 w-4 shrink-0" />}
                  <div>
                    <p className="text-sm font-medium">{ct.label}</p>
                    <p className="text-xs text-muted-foreground">{ct.desc}</p>
                  </div>
                  {alreadyGranted && <Badge className="ml-auto text-[10px] bg-secondary/20 text-secondary">Activo</Badge>}
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Revoke Consent Dialog */}
      <Dialog open={revokeDialog.open} onOpenChange={(o) => !o && setRevokeDialog({ open: false, id: '', childName: '', type: '' })}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Revogar Consentimento
            </DialogTitle>
            <DialogDescription>
              Estás a revogar o consentimento de <strong>{revokeDialog.type}</strong> para <strong>{revokeDialog.childName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo da revogação (opcional)"
            value={revokeReason}
            onChange={e => setRevokeReason(e.target.value)}
            className="rounded-xl"
            rows={3}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setRevokeDialog({ open: false, id: '', childName: '', type: '' })}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={revokeMutation.isPending}
              onClick={() => revokeMutation.mutate({ id: revokeDialog.id, reason: revokeReason })}
            >
              {revokeMutation.isPending ? 'A processar...' : 'Revogar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(o) => !o && setDetailDialog({ open: false, record: null })}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Detalhe do Consentimento</DialogTitle>
          </DialogHeader>
          {detailDialog.record && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
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
                  <p className="font-medium">{format(new Date(detailDialog.record.granted_at), 'dd/MM/yyyy HH:mm')}</p>
                </div>
                {detailDialog.record.revoked_at && (
                  <>
                    <div>
                      <p className="text-muted-foreground text-xs">Revogado em</p>
                      <p className="font-medium text-destructive">{format(new Date(detailDialog.record.revoked_at), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                    {detailDialog.record.revocation_reason && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground text-xs">Motivo</p>
                        <p className="font-medium">{detailDialog.record.revocation_reason}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

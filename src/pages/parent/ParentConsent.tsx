import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, ShieldOff, FileDown, Trash2, AlertTriangle, Eye, Plus, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useAllFeatures, FEATURES } from '@/hooks/use-feature-gate';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useT } from '@/contexts/LanguageContext';

const CONSENT_KEYS = ['platform_usage', 'data_collection', 'financial_education', 'teacher_access'] as const;

export default function ParentConsent() {
  const t = useT();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; id: string; childName: string; type: string }>({ open: false, id: '', childName: '', type: '' });
  const [revokeReason, setRevokeReason] = useState('');
  const [grantDialog, setGrantDialog] = useState<{ open: boolean; childId: string; childName: string }>({ open: false, childId: '', childName: '' });
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; record: any }>({ open: false, record: null });
  const [exportingChild, setExportingChild] = useState<string | null>(null);
  const { hasFeature } = useAllFeatures();
  const canExport = hasFeature(FEATURES.EXPORT_REPORTS);

  const consentTypes = CONSENT_KEYS.map(key => ({
    key,
    label: t(`parent.consent.type.${key}`),
    desc: t(`parent.consent.type.${key}_desc`),
  }));

  // Fetch children profiles
  const { data: children = [] } = useQuery({
    queryKey: ['parent-children-profiles', user?.profileId],
    enabled: !!user?.profileId,
    queryFn: async () => {
      const data = await api.get<any[]>('/children');
      return data ?? [];
    },
  });

  // Fetch consent records
  const { data: consents = [], isLoading } = useQuery({
    queryKey: ['parent-consent-records', user?.profileId],
    enabled: !!user?.profileId,
    queryFn: async () => {
      const data = await api.get<any[]>('/admin/compliance/consent-records');
      return data ?? [];
    },
  });

  const grantMutation = useMutation({
    mutationFn: async ({ childProfileId, consentType }: { childProfileId: string; consentType: string }) => {
      await api.post('/consent', {
        adult_profile_id: user!.profileId,
        child_profile_id: childProfileId,
        consent_type: consentType,
        metadata: { granted_via: 'parent_consent_panel', user_agent: navigator.userAgent },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent-consent-records'] });
      toast({ title: t('parent.consent.granted_toast') });
    },
    onError: (err: any) => toast({ title: t('common.error'), description: err.message, variant: 'destructive' }),
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await api.patch('/consent/' + id, { revoked_at: new Date().toISOString(), revocation_reason: reason });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent-consent-records'] });
      setRevokeDialog({ open: false, id: '', childName: '', type: '' });
      setRevokeReason('');
      toast({ title: t('parent.consent.revoked_toast') });
    },
    onError: (err: any) => toast({ title: t('common.error'), description: err.message, variant: 'destructive' }),
  });

  const handleExportData = async (childProfileId: string) => {
    setExportingChild(childProfileId);
    try {
      const data = await api.post<any>('/admin/export-user-data', { profile_id: childProfileId });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kivara-data-${childProfileId.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t('parent.consent.exported_toast') });
    } catch (err: any) {
      toast({ title: t('parent.consent.export_error'), description: err.message, variant: 'destructive' });
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
          <CardContent className="p-5 sm:p-6 relative z-10">
            <p className="text-primary-foreground/60 text-xs uppercase tracking-wider font-medium">{t('parent.consent.privacy')}</p>
            <h1 className="font-display text-xl sm:text-2xl font-bold mt-1">{t('parent.consent.title')}</h1>
            <p className="text-xs sm:text-sm text-primary-foreground/70 mt-1">{t('parent.consent.subtitle')}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-display font-bold text-lg">{activeConsents.length}</span>
                <span className="text-xs text-primary-foreground/60">{t('parent.consent.active')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2">
                <ShieldOff className="h-4 w-4" />
                <span className="font-display font-bold text-lg">{revokedConsents.length}</span>
                <span className="text-xs text-primary-foreground/60">{t('parent.consent.revoked')}</span>
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
            <h3 className="font-display font-bold text-lg mb-2">{t('parent.consent.no_children')}</h3>
            <p className="text-sm text-muted-foreground">{t('parent.consent.no_children_desc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Array.from(childMap.entries()).map(([profileId, child]) => (
            <motion.div key={profileId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
                         {child.avatar}
                       </div>
                       <div>
                         <CardTitle className="text-base font-display">{child.name}</CardTitle>
                         <p className="text-xs text-muted-foreground">{child.consents.length} {t('parent.consent.active_count')}</p>
                       </div>
                     </div>
                     <div className="flex gap-2 w-full sm:w-auto">
                       <Button
                         variant="outline"
                         size="sm"
                         className="rounded-xl text-xs gap-1.5 flex-1 sm:flex-none"
                         onClick={() => setGrantDialog({ open: true, childId: profileId, childName: child.name })}
                       >
                         <Plus className="h-3.5 w-3.5" /> {t('parent.consent.grant')}
                       </Button>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <span className="flex-1 sm:flex-none">
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="rounded-xl text-xs gap-1.5 w-full"
                                 disabled={!canExport || exportingChild === profileId}
                                 onClick={() => handleExportData(profileId)}
                               >
                                 {canExport ? <FileDown className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                 {exportingChild === profileId ? t('parent.consent.exporting') : t('parent.consent.export')}
                               </Button>
                             </span>
                           </TooltipTrigger>
                           {!canExport && (
                             <TooltipContent>
                               <p className="text-xs">{t('parent.consent.export_upgrade')}</p>
                             </TooltipContent>
                           )}
                         </Tooltip>
                       </TooltipProvider>
                     </div>
                   </div>
                </CardHeader>
                <CardContent className="space-y-2 px-4 sm:px-6">
                  {consentTypes.map(ct => {
                    const existing = child.consents.find((c: any) => c.consent_type === ct.key);
                    return (
                      <div key={ct.key} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 rounded-xl ${existing ? 'bg-secondary/5' : 'bg-muted/30'}`}>
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                          {existing ? (
                            <ShieldCheck className="h-4 w-4 text-secondary shrink-0 mt-0.5 sm:mt-0" />
                          ) : (
                            <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 sm:mt-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{ct.label}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 sm:line-clamp-1">{ct.desc}</p>
                          </div>
                        </div>
                        {existing ? (
                          <div className="flex items-center gap-2 shrink-0 ml-7 sm:ml-0">
                            <Badge className="bg-secondary/20 text-secondary text-xs">
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
                          <div className="ml-7 sm:ml-0">
                            <Badge variant="outline" className="text-xs text-muted-foreground">{t('parent.consent.not_granted')}</Badge>
                          </div>
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
              <ShieldOff className="h-4 w-4" /> {t('parent.consent.revocation_history')} ({revokedConsents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
             {revokedConsents.slice(0, 10).map((c: any) => (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0">{c.child?.avatar || '👤'}</span>
                  <span className="font-medium truncate">{c.child?.display_name}</span>
                  <span className="text-muted-foreground hidden sm:inline">·</span>
                  <span className="text-muted-foreground text-xs truncate">{c.consent_type}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
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
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-secondary shrink-0" /> {t('parent.consent.grant_title')}
            </DialogTitle>
            <DialogDescription>{t('parent.consent.grant_desc')} {grantDialog.childName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {consentTypes.map(ct => {
              const alreadyGranted = consents.some((c: any) =>
                c.child_profile_id === grantDialog.childId && c.consent_type === ct.key && !c.revoked_at
              );
              return (
                <Button
                  key={ct.key}
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 rounded-xl text-left whitespace-normal"
                  disabled={alreadyGranted || grantMutation.isPending}
                  onClick={() => {
                    grantMutation.mutate({ childProfileId: grantDialog.childId, consentType: ct.key });
                    setGrantDialog({ open: false, childId: '', childName: '' });
                  }}
                >
                  {alreadyGranted ? <ShieldCheck className="h-4 w-4 text-secondary shrink-0" /> : <Shield className="h-4 w-4 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{ct.label}</p>
                    <p className="text-xs text-muted-foreground whitespace-normal">{ct.desc}</p>
                  </div>
                  {alreadyGranted && <Badge className="ml-auto text-xs bg-secondary/20 text-secondary shrink-0">{t('parent.consent.active_badge')}</Badge>}
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Revoke Consent Dialog */}
      <Dialog open={revokeDialog.open} onOpenChange={(o) => !o && setRevokeDialog({ open: false, id: '', childName: '', type: '' })}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> {t('parent.consent.revoke_title')}
            </DialogTitle>
            <DialogDescription>
              {t('parent.consent.revoke_desc_pre')} <strong>{revokeDialog.type}</strong> {t('parent.consent.revoke_desc_mid')} <strong>{revokeDialog.childName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={t('parent.consent.revoke_reason')}
            value={revokeReason}
            onChange={e => setRevokeReason(e.target.value)}
            className="rounded-xl"
            rows={3}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setRevokeDialog({ open: false, id: '', childName: '', type: '' })}>
              {t('parent.consent.cancel')}
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={revokeMutation.isPending}
              onClick={() => revokeMutation.mutate({ id: revokeDialog.id, reason: revokeReason })}
            >
              {revokeMutation.isPending ? t('parent.consent.processing') : t('parent.consent.revoke')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(o) => !o && setDetailDialog({ open: false, record: null })}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{t('parent.consent.detail_title')}</DialogTitle>
          </DialogHeader>
          {detailDialog.record && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">{t('parent.consent.child')}</p>
                  <p className="font-medium">{detailDialog.record.child?.display_name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{t('parent.consent.type')}</p>
                  <p className="font-medium">{detailDialog.record.consent_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{t('parent.consent.granted_at')}</p>
                  <p className="font-medium">{format(new Date(detailDialog.record.granted_at), 'dd/MM/yyyy HH:mm')}</p>
                </div>
                {detailDialog.record.revoked_at && (
                  <>
                    <div>
                      <p className="text-muted-foreground text-xs">{t('parent.consent.revoked_at')}</p>
                      <p className="font-medium text-destructive">{format(new Date(detailDialog.record.revoked_at), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                    {detailDialog.record.revocation_reason && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground text-xs">{t('parent.consent.reason')}</p>
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

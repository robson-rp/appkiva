import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { School, Plus, Edit, Trash2, Search, GraduationCap } from 'lucide-react';
import { useT } from '@/contexts/LanguageContext';

interface SchoolTenant { id: string; name: string; currency: string; is_active: boolean; created_at: string; subscription_tier_id: string | null; settings: any; }

function useSchools() {
  return useQuery({ queryKey: ['admin-schools'], queryFn: async () => { const { data, error } = await supabase.from('tenants').select('*').eq('tenant_type', 'school').order('name'); if (error) throw error; return data as SchoolTenant[]; } });
}
function useSubscriptionTiers() {
  return useQuery({ queryKey: ['subscription-tiers-school'], queryFn: async () => { const { data, error } = await supabase.from('subscription_tiers').select('id, name, tier_type').eq('is_active', true); if (error) throw error; return data; } });
}

export default function AdminSchools() {
  const t = useT();
  const { data: schools = [], isLoading } = useSchools();
  const { data: tiers = [] } = useSubscriptionTiers();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSchool, setEditSchool] = useState<SchoolTenant | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [tierId, setTierId] = useState('');
  const [isActive, setIsActive] = useState(true);

  const openCreate = () => { setEditSchool(null); setName(''); setTierId(''); setIsActive(true); setDialogOpen(true); };
  const openEdit = (school: SchoolTenant) => { setEditSchool(school); setName(school.name); setTierId(school.subscription_tier_id || ''); setIsActive(school.is_active); setDialogOpen(true); };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editSchool) {
        const { error } = await supabase.from('tenants').update({ name, subscription_tier_id: tierId || null, is_active: isActive }).eq('id', editSchool.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tenants').insert({ name, tenant_type: 'school', subscription_tier_id: tierId || null, is_active: isActive, currency: 'AOA' });
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-schools'] }); setDialogOpen(false); toast({ title: editSchool ? t('admin.schools.updated') : t('admin.schools.registered') }); },
    onError: (err: any) => { toast({ title: t('admin.schools.error'), description: err.message, variant: 'destructive' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('tenants').update({ is_active: false }).eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-schools'] }); setDeleteConfirm(null); toast({ title: t('admin.schools.deactivated') }); },
  });

  const filtered = schools.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const activeCount = schools.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-primary-foreground/60 text-xs uppercase tracking-wider font-medium">{t('admin.schools.admin_label')}</p>
                <h1 className="font-display text-2xl font-bold mt-1">{t('admin.schools.title')}</h1>
                <p className="text-sm text-primary-foreground/70 mt-1">{t('admin.schools.subtitle')}</p>
              </div>
              <Button onClick={openCreate} className="rounded-2xl font-display gap-1.5 bg-white/15 hover:bg-white/25 text-primary-foreground border-0 backdrop-blur-sm">
                <Plus className="h-4 w-4" /> {t('admin.schools.register')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <School className="h-4 w-4" />
                <span className="font-display font-bold text-lg">{schools.length}</span>
                <span className="text-xs text-primary-foreground/60">{t('admin.schools.total')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <GraduationCap className="h-4 w-4" />
                <span className="font-display font-bold text-lg">{activeCount}</span>
                <span className="text-xs text-primary-foreground/60">{t('admin.schools.active_label')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('admin.schools.search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (<Card key={i} className="overflow-hidden"><div className="h-1 bg-gradient-to-r from-primary to-accent" /><CardContent className="p-5 space-y-3"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-full" /></CardContent></Card>))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <div className="text-5xl mb-4">🏫</div>
            <h3 className="font-display font-bold text-lg mb-2">{search ? t('admin.schools.not_found') : t('admin.schools.no_schools')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{search ? t('admin.schools.search_hint') : t('admin.schools.no_schools_desc')}</p>
            {!search && <Button className="rounded-xl font-display gap-1.5" onClick={openCreate}><Plus className="h-4 w-4" /> {t('admin.schools.register')}</Button>}
          </CardContent>
        </Card>
      ) : (
        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(school => {
            const tier = tiers.find(ti => ti.id === school.subscription_tier_id);
            return (
              <motion.div key={school.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -4 }}>
                <Card className={`group hover:shadow-md transition-all overflow-hidden border-border/50 ${!school.is_active ? 'opacity-60' : ''}`}>
                  <div className="h-1 bg-gradient-to-r from-primary to-accent" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center"><School className="h-6 w-6 text-primary" /></div>
                        <div>
                          <h3 className="font-display font-bold text-base">{school.name}</h3>
                          <p className="text-xs text-muted-foreground">{school.is_active ? t('admin.schools.active') : t('admin.schools.inactive')}</p>
                        </div>
                      </div>
                    </div>
                    {tier && (<div className="flex items-center gap-1.5 bg-accent/10 rounded-lg px-2.5 py-1.5 mb-3 w-fit"><span className="text-xs font-display font-medium text-accent-foreground">{tier.name}</span></div>)}
                    <p className="text-xs text-muted-foreground mb-4">{t('admin.schools.registered_at')} {new Date(school.created_at).toLocaleDateString('pt-PT')}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl font-display gap-1.5 text-xs" onClick={() => openEdit(school)}><Edit className="h-3.5 w-3.5" /> {t('admin.schools.edit')}</Button>
                      <Button variant="outline" size="icon" className="rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground h-9 w-9" onClick={() => setDeleteConfirm(school.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center"><School className="h-5 w-5 text-primary" /></div>
              {editSchool ? t('admin.schools.edit_title') : t('admin.schools.register_title')}
            </DialogTitle>
            <DialogDescription>{editSchool ? t('admin.schools.edit_desc') : t('admin.schools.register_desc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold">{t('admin.schools.label_name')}</Label>
              <Input placeholder={t('admin.schools.name_placeholder')} value={name} onChange={e => setName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">{t('admin.schools.label_plan')}</Label>
              <Select value={tierId} onValueChange={setTierId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder={t('admin.schools.plan_placeholder')} /></SelectTrigger>
                <SelectContent>{tiers.map(ti => <SelectItem key={ti.id} value={ti.id}>{ti.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">{t('admin.schools.label_status')}</Label>
              <Select value={isActive ? 'active' : 'inactive'} onValueChange={v => setIsActive(v === 'active')}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('admin.schools.active')}</SelectItem>
                  <SelectItem value="inactive">{t('admin.schools.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={!name.trim() || saveMutation.isPending} className="w-full rounded-xl font-display h-11">
              {saveMutation.isPending ? t('admin.schools.saving') : editSchool ? t('admin.schools.save_changes') : t('admin.schools.register')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{t('admin.schools.deactivate_title')}</DialogTitle>
            <DialogDescription>{t('admin.schools.deactivate_desc')}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteConfirm(null)}>{t('admin.schools.cancel')}</Button>
            <Button variant="destructive" className="flex-1 rounded-xl" onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t('admin.schools.processing') : t('admin.schools.deactivate')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

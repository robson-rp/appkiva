import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Globe, ArrowRightLeft, Pencil, Plus, Loader2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useT } from '@/contexts/LanguageContext';

interface CurrencyRow { code: string; name: string; symbol: string; decimal_places: number; is_active: boolean; }
interface RateRow { id: string; base_currency: string; target_currency: string; rate: number; updated_at: string; }

function CurrenciesTab() {
  const t = useT();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ code: '', name: '', symbol: '', decimal_places: 2 });

  const { data: currencies = [], isLoading } = useQuery({
    queryKey: ['admin-currencies'],
    queryFn: async () => { const { data, error } = await supabase.from('supported_currencies').select('*').order('code'); if (error) throw error; return data as CurrencyRow[]; },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ code, is_active }: { code: string; is_active: boolean }) => { const { error } = await supabase.from('supported_currencies').update({ is_active }).eq('code', code); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-currencies'] }); toast.success(t('admin.currencies.status_updated')); },
    onError: (e: any) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: async (vals: { code: string; name: string; symbol: string; decimal_places: number }) => { const { error } = await supabase.from('supported_currencies').insert({ ...vals, is_active: true }); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-currencies'] }); toast.success(t('admin.currencies.created')); setAddOpen(false); setAddForm({ code: '', name: '', symbol: '', decimal_places: 2 }); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleCreate = () => {
    if (!addForm.code.trim() || !addForm.name.trim() || !addForm.symbol.trim()) { toast.error(t('admin.currencies.fill_all')); return; }
    createMutation.mutate({ ...addForm, code: addForm.code.toUpperCase() });
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <>
      <div className="flex justify-end mb-4"><Button onClick={() => setAddOpen(true)} className="gap-1.5" size="sm"><Plus className="h-4 w-4" /> {t('admin.currencies.new_currency')}</Button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currencies.map((c) => (
          <Card key={c.code} className={`border-border/50 transition-opacity ${!c.is_active ? 'opacity-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{c.code}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={c.is_active ? 'default' : 'outline'} className="text-xs">{c.is_active ? t('admin.currencies.active') : t('admin.currencies.inactive')}</Badge>
                <Switch checked={c.is_active} onCheckedChange={(v) => toggleMutation.mutate({ code: c.code, is_active: v })} className="scale-75" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-display font-bold">{c.symbol}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.decimal_places} {t('admin.currencies.decimal_places')}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="font-display flex items-center gap-2"><Plus className="h-4 w-4 text-primary" />{t('admin.currencies.dialog_title')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t('admin.currencies.label_code')}</Label><Input value={addForm.code} onChange={(e) => setAddForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="font-mono mt-1" maxLength={5} placeholder={t('admin.currencies.code_placeholder')} /></div>
            <div><Label>{t('admin.currencies.label_name')}</Label><Input value={addForm.name} onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))} className="mt-1" placeholder={t('admin.currencies.name_placeholder')} /></div>
            <div><Label>{t('admin.currencies.label_symbol')}</Label><Input value={addForm.symbol} onChange={(e) => setAddForm(f => ({ ...f, symbol: e.target.value }))} className="mt-1" maxLength={5} placeholder={t('admin.currencies.symbol_placeholder')} /></div>
            <div><Label>{t('admin.currencies.label_decimals')}</Label><Input type="number" min={0} max={4} value={addForm.decimal_places} onChange={(e) => setAddForm(f => ({ ...f, decimal_places: parseInt(e.target.value) || 0 }))} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>{t('admin.currencies.cancel')}</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? t('admin.currencies.creating') : t('admin.currencies.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ExchangeRatesTab() {
  const t = useT();
  const queryClient = useQueryClient();
  const [editRate, setEditRate] = useState<RateRow | null>(null);
  const [newRate, setNewRate] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ base: 'EUR', target: '', rate: '' });

  const { data: rates = [], isLoading } = useQuery({
    queryKey: ['admin-exchange-rates'],
    queryFn: async () => { const { data, error } = await supabase.from('currency_exchange_rates').select('*').order('target_currency'); if (error) throw error; return data as RateRow[]; },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, rate }: { id: string; rate: number }) => { const { error } = await supabase.from('currency_exchange_rates').update({ rate, updated_at: new Date().toISOString() }).eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-exchange-rates'] }); queryClient.invalidateQueries({ queryKey: ['exchange-rates'] }); toast.success(t('admin.currencies.rate_updated')); setEditRate(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const addMutation = useMutation({
    mutationFn: async (vals: { base_currency: string; target_currency: string; rate: number }) => { const { error } = await supabase.from('currency_exchange_rates').insert(vals); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-exchange-rates'] }); queryClient.invalidateQueries({ queryKey: ['exchange-rates'] }); toast.success(t('admin.currencies.rate_added')); setAddOpen(false); setAddForm({ base: 'EUR', target: '', rate: '' }); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleUpdate = () => { if (!editRate) return; const val = parseFloat(newRate); if (isNaN(val) || val <= 0) { toast.error(t('admin.currencies.invalid_rate')); return; } updateMutation.mutate({ id: editRate.id, rate: val }); };
  const handleAdd = () => { const val = parseFloat(addForm.rate); if (!addForm.target.trim() || isNaN(val) || val <= 0) { toast.error(t('admin.currencies.fill_all')); return; } addMutation.mutate({ base_currency: addForm.base, target_currency: addForm.target.toUpperCase(), rate: val }); };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <>
      <div className="flex justify-end mb-4"><Button onClick={() => setAddOpen(true)} className="gap-1.5" size="sm"><Plus className="h-4 w-4" /> {t('admin.currencies.new_rate')}</Button></div>
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>{t('admin.currencies.base')}</TableHead><TableHead>{t('admin.currencies.target')}</TableHead><TableHead className="text-right">{t('admin.currencies.rate')}</TableHead><TableHead>{t('admin.currencies.last_update')}</TableHead><TableHead className="text-right">{t('admin.currencies.actions')}</TableHead></TableRow></TableHeader>
            <TableBody>
              {rates.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t('admin.currencies.no_rates')}</TableCell></TableRow>
              ) : rates.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono font-medium">{r.base_currency}</TableCell>
                  <TableCell className="font-mono font-medium">{r.target_currency}</TableCell>
                  <TableCell className="text-right font-mono">{Number(r.rate).toFixed(4)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleDateString('pt', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { setEditRate(r); setNewRate(String(r.rate)); }}><Pencil className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editRate} onOpenChange={(o) => !o && setEditRate(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="font-display flex items-center gap-2"><RefreshCw className="h-4 w-4 text-primary" />{t('admin.currencies.edit_rate')}</DialogTitle></DialogHeader>
          {editRate && (<div className="space-y-4">
            <div className="flex items-center gap-2 justify-center text-lg font-mono font-bold"><span>{editRate.base_currency}</span><ArrowRightLeft className="h-4 w-4 text-muted-foreground" /><span>{editRate.target_currency}</span></div>
            <div><Label>{t('admin.currencies.new_rate_label')}</Label><Input type="number" step="0.0001" min="0" value={newRate} onChange={(e) => setNewRate(e.target.value)} className="font-mono mt-1" /><p className="text-xs text-muted-foreground mt-1">1 {editRate.base_currency} = {newRate || '?'} {editRate.target_currency}</p></div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setEditRate(null)}>{t('admin.currencies.cancel')}</Button><Button onClick={handleUpdate} disabled={updateMutation.isPending}>{updateMutation.isPending ? t('admin.currencies.saving') : t('admin.currencies.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="font-display flex items-center gap-2"><Plus className="h-4 w-4 text-primary" />{t('admin.currencies.new_rate_dialog')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t('admin.currencies.base_currency')}</Label><Input value={addForm.base} onChange={(e) => setAddForm(f => ({ ...f, base: e.target.value.toUpperCase() }))} className="font-mono mt-1" maxLength={5} /></div>
            <div><Label>{t('admin.currencies.target_currency')}</Label><Input value={addForm.target} onChange={(e) => setAddForm(f => ({ ...f, target: e.target.value.toUpperCase() }))} className="font-mono mt-1" maxLength={5} placeholder={t('admin.currencies.target_placeholder')} /></div>
            <div><Label>{t('admin.currencies.rate')}</Label><Input type="number" step="0.0001" min="0" value={addForm.rate} onChange={(e) => setAddForm(f => ({ ...f, rate: e.target.value }))} className="font-mono mt-1" placeholder={t('admin.currencies.rate_placeholder')} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>{t('admin.currencies.cancel')}</Button><Button onClick={handleAdd} disabled={addMutation.isPending}>{addMutation.isPending ? t('admin.currencies.adding') : t('admin.currencies.add')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminCurrencies() {
  const t = useT();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{t('admin.currencies.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.currencies.subtitle')}</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Tabs defaultValue="currencies">
          <TabsList>
            <TabsTrigger value="currencies" className="gap-1.5"><Globe className="h-3.5 w-3.5" /> {t('admin.currencies.tab_currencies')}</TabsTrigger>
            <TabsTrigger value="rates" className="gap-1.5"><ArrowRightLeft className="h-3.5 w-3.5" /> {t('admin.currencies.tab_rates')}</TabsTrigger>
          </TabsList>
          <TabsContent value="currencies" className="mt-4"><CurrenciesTab /></TabsContent>
          <TabsContent value="rates" className="mt-4"><ExchangeRatesTab /></TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

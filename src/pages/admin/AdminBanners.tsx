import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, GripVertical, ExternalLink, Image as ImageIcon, MousePointerClick, TrendingUp, BarChart3 } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useT } from '@/contexts/LanguageContext';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface BannerClickStats {
  banner_id: string;
  total_clicks: number;
  clicks_today: number;
  clicks_7d: number;
}

const EMPTY_FORM = { title: '', image_url: '', link_url: '', display_order: 0, is_active: true };

export default function AdminBanners() {
  const t = useT();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [clickStats, setClickStats] = useState<Record<string, BannerClickStats>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchBanners = async () => {
    try {
      const data = await api.get<Banner[]>('/admin/login-banners');
      if (data) setBanners(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchClickStats = async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const allClicks = await api.get<{ banner_id: string; clicked_at: string }[]>('/admin/banner-clicks');
      if (!allClicks) return;

      const statsMap: Record<string, BannerClickStats> = {};
      for (const click of allClicks) {
        if (!statsMap[click.banner_id]) {
          statsMap[click.banner_id] = { banner_id: click.banner_id, total_clicks: 0, clicks_today: 0, clicks_7d: 0 };
        }
        statsMap[click.banner_id].total_clicks++;
        if (click.clicked_at >= todayStart) statsMap[click.banner_id].clicks_today++;
        if (click.clicked_at >= weekAgo) statsMap[click.banner_id].clicks_7d++;
      }
      setClickStats(statsMap);
    } catch {
      // click stats are non-critical
    }
  };

  useEffect(() => { fetchBanners(); fetchClickStats(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, display_order: banners.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({ title: b.title, image_url: b.image_url, link_url: b.link_url || '', display_order: b.display_order, is_active: b.is_active });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    try {
      const token = localStorage.getItem('kivara_token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      const res = await fetch(`${apiBase}/admin/login-banners/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload failed' }));
        toast({ title: t('admin.banners.upload_error'), description: err.message, variant: 'destructive' });
      } else {
        const imageUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1') + '/storage/' + path;
        setForm(f => ({ ...f, image_url: imageUrl }));
      }
    } catch (err: any) {
      toast({ title: t('admin.banners.upload_error'), description: err.message, variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.image_url) {
      toast({ title: t('admin.banners.fill_required'), variant: 'destructive' });
      return;
    }
    const payload = {
      title: form.title,
      image_url: form.image_url,
      link_url: form.link_url || null,
      display_order: form.display_order,
    };

    if (editing) {
      try {
        await api.patch('/admin/login-banners/' + editing.id, payload);
        if (form.is_active !== editing.is_active) {
          await api.post('/admin/login-banners/' + editing.id + '/toggle-active', {});
        }
        toast({ title: t('admin.banners.updated') });
      } catch (e: any) {
        toast({ title: t('admin.banners.error'), description: e.message, variant: 'destructive' }); return;
      }
    } else {
      try {
        await api.post('/admin/login-banners', { ...payload, is_active: form.is_active });
        toast({ title: t('admin.banners.created') });
      } catch (e: any) {
        toast({ title: t('admin.banners.error'), description: e.message, variant: 'destructive' }); return;
      }
    }
    setDialogOpen(false);
    fetchBanners();
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete('/admin/login-banners/' + id);
      toast({ title: t('admin.banners.deleted') });
      fetchBanners();
      fetchClickStats();
    } catch (e: any) {
      toast({ title: t('admin.banners.error'), description: e.message, variant: 'destructive' });
    }
  };

  const handleToggleActive = async (b: Banner) => {
    await api.patch('/admin/login-banners/' + b.id, { is_active: !b.is_active });
    fetchBanners();
  };

  const moveOrder = async (b: Banner, direction: -1 | 1) => {
    const idx = banners.findIndex(x => x.id === b.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= banners.length) return;
    const other = banners[swapIdx];
    await Promise.all([
      api.patch('/admin/login-banners/' + b.id, { display_order: other.display_order }),
      api.patch('/admin/login-banners/' + other.id, { display_order: b.display_order }),
    ]);
    fetchBanners();
  };

  const totalClicks = Object.values(clickStats).reduce((s, c) => s + c.total_clicks, 0);
  const totalToday = Object.values(clickStats).reduce((s, c) => s + c.clicks_today, 0);
  const total7d = Object.values(clickStats).reduce((s, c) => s + c.clicks_7d, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-heading font-bold text-foreground">{t('admin.banners.title')}</h1>
          <p className="text-muted-foreground text-small">{t('admin.banners.subtitle')}</p>
        </div>
        <Button onClick={openCreate} className="gap-2" disabled={banners.length >= 5}>
          <Plus className="h-4 w-4" />
          {t('admin.banners.new')}
        </Button>
      </div>

      {totalClicks > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <MousePointerClick className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-caption text-muted-foreground">{t('admin.banners.total_clicks')}</p>
                <p className="text-lg font-bold text-foreground">{totalClicks}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-caption text-muted-foreground">{t('admin.banners.last_7d')}</p>
                <p className="text-lg font-bold text-foreground">{total7d}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-caption text-muted-foreground">{t('admin.banners.today')}</p>
                <p className="text-lg font-bold text-foreground">{totalToday}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{t('admin.banners.no_banners')}</p>
            <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> {t('admin.banners.create_first')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {banners.map((b, idx) => {
            const stats = clickStats[b.id];
            return (
              <Card key={b.id} className={`transition-opacity ${!b.is_active ? 'opacity-50' : ''}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveOrder(b, -1)} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-1">
                      <GripVertical className="h-4 w-4 rotate-180" />
                    </button>
                    <span className="text-caption text-center text-muted-foreground font-mono">{b.display_order}</span>
                    <button onClick={() => moveOrder(b, 1)} disabled={idx === banners.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-1">
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="w-32 shrink-0 rounded-xl overflow-hidden border border-border">
                    <AspectRatio ratio={3}>
                      <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                    </AspectRatio>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-foreground truncate">{b.title}</p>
                    {b.link_url && (
                      <a href={b.link_url} target="_blank" rel="noopener noreferrer" className="text-small text-primary flex items-center gap-1 hover:underline">
                        <ExternalLink className="h-3 w-3" /> Link
                      </a>
                    )}
                    {stats && (
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-caption text-muted-foreground flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" /> {stats.total_clicks} total
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {stats.clicks_7d} (7d)
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {stats.clicks_today} {t('admin.banners.today').toLowerCase()}
                        </span>
                      </div>
                    )}
                    {b.link_url && !stats && (
                      <p className="text-caption text-muted-foreground/50 mt-1">{t('admin.banners.no_clicks')}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Switch checked={b.is_active} onCheckedChange={() => handleToggleActive(b)} />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-caption text-muted-foreground">{t('admin.banners.max_info')}</p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? t('admin.banners.edit') : t('admin.banners.new_dialog')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('admin.banners.label_title')}</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={t('admin.banners.placeholder_title')} />
            </div>

            <div>
              <Label>{t('admin.banners.label_image')}</Label>
              {form.image_url && (
                <div className="mb-2 rounded-xl overflow-hidden border border-border">
                  <AspectRatio ratio={3}>
                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </AspectRatio>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder={t('admin.banners.placeholder_image')}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" className="shrink-0 relative" disabled={uploading}>
                  <ImageIcon className="h-4 w-4" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </Button>
              </div>
            </div>

            <div>
              <Label>{t('admin.banners.label_link')}</Label>
              <Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="https://..." />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>{t('admin.banners.label_active')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('admin.banners.cancel')}</Button>
            <Button onClick={handleSave} disabled={uploading}>{editing ? t('admin.banners.save') : t('admin.banners.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, GripVertical, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const EMPTY_FORM = { title: '', image_url: '', link_url: '', display_order: 0, is_active: true };

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('login_banners')
      .select('*')
      .order('display_order');
    if (data) setBanners(data);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

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
    const { error } = await supabase.storage.from('banners').upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'Erro ao carregar imagem', description: error.message, variant: 'destructive' });
    } else {
      const { data } = supabase.storage.from('banners').getPublicUrl(path);
      setForm(f => ({ ...f, image_url: data.publicUrl }));
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.image_url) {
      toast({ title: 'Preenche o título e a imagem', variant: 'destructive' });
      return;
    }
    const payload = {
      title: form.title,
      image_url: form.image_url,
      link_url: form.link_url || null,
      display_order: form.display_order,
      is_active: form.is_active,
    };

    if (editing) {
      const { error } = await supabase.from('login_banners').update(payload).eq('id', editing.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Banner atualizado' });
    } else {
      const { error } = await supabase.from('login_banners').insert(payload);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Banner criado' });
    }
    setDialogOpen(false);
    fetchBanners();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('login_banners').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Banner eliminado' });
    fetchBanners();
  };

  const handleToggleActive = async (b: Banner) => {
    await supabase.from('login_banners').update({ is_active: !b.is_active }).eq('id', b.id);
    fetchBanners();
  };

  const moveOrder = async (b: Banner, direction: -1 | 1) => {
    const idx = banners.findIndex(x => x.id === b.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= banners.length) return;
    const other = banners[swapIdx];
    await Promise.all([
      supabase.from('login_banners').update({ display_order: other.display_order }).eq('id', b.id),
      supabase.from('login_banners').update({ display_order: b.display_order }).eq('id', other.id),
    ]);
    fetchBanners();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-heading font-bold text-foreground">Banners</h1>
          <p className="text-muted-foreground text-small">Gestão de banners publicitários da página de login</p>
        </div>
        <Button onClick={openCreate} className="gap-2" disabled={banners.length >= 5}>
          <Plus className="h-4 w-4" />
          Novo Banner
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhum banner criado</p>
            <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Criar primeiro banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {banners.map((b, idx) => (
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
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Switch checked={b.is_active} onCheckedChange={() => handleToggleActive(b)} />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-caption text-muted-foreground">Máximo 5 banners. Apenas banners activos são exibidos na página de login.</p>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nome da campanha" />
            </div>

            <div>
              <Label>Imagem *</Label>
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
                  placeholder="URL da imagem ou faz upload"
                  className="flex-1"
                />
                <Button variant="outline" size="icon" className="shrink-0 relative" disabled={uploading}>
                  <ImageIcon className="h-4 w-4" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Link (opcional)</Label>
              <Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="https://..." />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={uploading}>{editing ? 'Guardar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

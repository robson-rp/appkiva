import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Camera, Save, Building2, Mail, Globe } from 'lucide-react';
import { COUNTRY_CURRENCIES, getCurrencyByCountry } from '@/data/countries-currencies';

const avatarOptions = ['🏦', '🏢', '🏛️', '🤝', '🌍', '💼', '🎯', '🏗️'];

export default function PartnerProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🏦');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [country, setCountry] = useState('AO');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('country')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.country) setCountry(data.country);
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.profileId) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ country } as any)
      .eq('id', user.profileId);

    // Also update the tenant's currency to keep it in sync
    if (!error) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.profileId)
        .single();
      if (profile?.tenant_id) {
        const newCurrency = getCurrencyByCountry(country);
        await supabase
          .from('tenants')
          .update({ currency: newCurrency } as any)
          .eq('id', profile.tenant_id);
      }
    }

    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao guardar', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['tenant-currency'] });
      toast({ title: 'Perfil atualizado! ✅', description: 'As alterações foram guardadas.' });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <CardContent className="p-6 relative z-10 flex items-center gap-5">
            <div className="relative">
              <motion.div
                className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl cursor-pointer border-2 border-white/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              >
                {selectedAvatar}
              </motion.div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg">
                <Camera className="h-3.5 w-3.5 text-accent-foreground" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{name}</h1>
              <p className="text-sm opacity-80">{email}</p>
              <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 mt-2 w-fit">
                <Building2 className="h-3 w-3" />
                <span className="text-xs font-medium">Parceiro Institucional</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Avatar Picker */}
      {showAvatarPicker && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm font-display font-semibold mb-3">Escolhe o avatar</p>
              <div className="flex flex-wrap gap-2">
                {avatarOptions.map((av) => (
                  <motion.button
                    key={av}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setSelectedAvatar(av); setShowAvatarPicker(false); }}
                    className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all ${
                      selectedAvatar === av
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {av}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="font-display font-semibold">Dados da Organização</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
              </Label>
              <Input id="email" type="email" value={email} readOnly className="rounded-xl bg-muted/30" />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" /> País / Moeda
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name} — {c.currencySymbol} ({c.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">A moeda dos relatórios e investimentos será ajustada automaticamente.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl font-display h-12 text-base gap-2">
          <Save className="h-4 w-4" /> {saving ? 'A guardar...' : 'Guardar Alterações'}
        </Button>
      </motion.div>
    </div>
  );
}

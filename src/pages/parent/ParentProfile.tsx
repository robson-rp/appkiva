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
import { getCurrencyByCountry } from '@/data/countries-currencies';
import { Camera, Save, User, Mail, Phone, Shield, Users, Crown, Globe, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAllFeatures } from '@/hooks/use-feature-gate';
import { COUNTRY_CURRENCIES } from '@/data/countries-currencies';

const avatarOptions = ['👩', '👨', '👩‍💼', '👨‍💼', '🧑', '👩‍🏫', '👨‍🏫', '🦸‍♀️'];

export default function ParentProfile() {
  const { tierName } = useAllFeatures();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '👩');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [country, setCountry] = useState('AO');
  const [gender, setGender] = useState('');
  const [schoolTenantId, setSchoolTenantId] = useState('');
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Load current country, gender and school from profile
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('country, gender, school_tenant_id')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.country) setCountry(data.country);
        if (data?.gender) setGender(data.gender);
        if (data?.school_tenant_id) setSchoolTenantId(data.school_tenant_id);
      });
  }, [user?.id]);

  // Load available schools
  useEffect(() => {
    supabase
      .from('tenants')
      .select('id, name')
      .eq('tenant_type', 'school')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) setSchools(data);
      });
  }, []);

  const handleSave = async () => {
    if (!user?.profileId) return;
    setSaving(true);
    const updatedSchool = schoolTenantId && schoolTenantId !== 'none' ? schoolTenantId : null;
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: name.trim() || user.name,
        avatar: selectedAvatar,
        phone: phone.trim() || null,
        country,
        gender: gender || null,
        school_tenant_id: updatedSchool,
      })
      .eq('id', user.profileId);

    // Also update the tenant's currency to keep household in sync
    if (!error) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.profileId)
        .single();
      if (profile?.tenant_id) {
        const newCurrency = getCurrencyByCountry(country);
        await supabase.rpc('update_tenant_currency', {
          _tenant_id: profile.tenant_id,
          _currency: newCurrency,
        } as any);
      }
    }

    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao guardar', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['tenant-currency'] });
      toast({ title: 'Perfil atualizado! ✅', description: 'As tuas alterações foram guardadas com sucesso.' });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
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
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                  <Shield className="h-3 w-3" />
                  <span className="text-xs font-medium">Encarregado</span>
                </div>
                <Link to="/parent/subscription" className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 rounded-full px-3 py-1 transition-colors">
                  <Crown className="h-3 w-3" />
                  <span className="text-xs font-medium">{tierName ?? 'Gratuito'}</span>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Avatar Picker */}
      {showAvatarPicker && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm font-display font-semibold mb-3">Escolhe o teu avatar</p>
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
              <User className="h-4 w-4 text-primary" />
              <h2 className="font-display font-semibold">Dados Pessoais</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" /> Género
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
              </Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Telemóvel
              </Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" />
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
              <p className="text-xs text-muted-foreground">A moeda apresentada na aplicação será ajustada automaticamente.</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" /> Escola dos filhos
              </Label>
              <Select value={schoolTenantId || 'none'} onValueChange={setSchoolTenantId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecionar escola" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (editar depois)</SelectItem>
                  {schools.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Associa a escola dos teus filhos quando estiver disponível.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Family Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-display font-semibold">Família</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/50 text-center">
                <p className="text-2xl font-display font-bold text-primary">2</p>
                <p className="text-xs text-muted-foreground mt-1">Crianças</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/50 text-center">
                <p className="text-2xl font-display font-bold text-secondary">5</p>
                <p className="text-xs text-muted-foreground mt-1">Tarefas Ativas</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>ID da Família</Label>
              <Input value={user?.householdId || '—'} readOnly className="rounded-xl bg-muted/30 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl font-display h-12 text-base gap-2">
          <Save className="h-4 w-4" /> {saving ? 'A guardar...' : 'Guardar Alterações'}
        </Button>
      </motion.div>
    </div>
  );
}

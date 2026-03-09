import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Camera, Save, Loader2, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChangePasswordSection } from '@/components/ChangePasswordSection';

const AVATAR_OPTIONS = ['👧', '👦', '🧒', '👶', '🧒🏽', '👧🏾', '👦🏻', '👧🏼', '🧒🏿', '👦🏽', '🦊', '🐱', '🐶', '🦁', '🐼', '🐰'];

export default function ChildProfile() {
  const { user } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const [avatar, setAvatar] = useState(user?.avatar || '🦊');
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('avatar, display_name')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.avatar) setAvatar(data.avatar);
        if (data?.display_name) setDisplayName(data.display_name);
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.profileId) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ avatar, language: locale })
      .eq('id', user.profileId);
    setSaving(false);
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('profile.updated') + ' ✨' });
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <CardContent className="p-6 relative z-10 flex flex-col items-center gap-3 text-center">
            <motion.div
              className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-6xl cursor-pointer border-2 border-white/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPicker(!showPicker)}
            >
              {avatar}
            </motion.div>
            <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg cursor-pointer" onClick={() => setShowPicker(!showPicker)}>
              <Camera className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">{displayName}</h1>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
              <span className="text-xs font-medium">{t('child.profile.role')}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Avatar Picker */}
      {showPicker && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <Label className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground mb-3 block">{t('profile.choose_avatar')}</Label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { setAvatar(emoji); setShowPicker(false); }}
                    className={cn(
                      'w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all duration-200 border-2',
                      avatar === emoji
                        ? 'border-primary bg-primary/10 scale-110 shadow-md'
                        : 'border-transparent bg-muted/50 hover:bg-muted hover:scale-105'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Languages className="h-4 w-4 text-primary" />
              <h2 className="font-display font-semibold">{t('profile.preferences')}</h2>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5 text-muted-foreground" /> {t('profile.language')}
              </Label>
              <Select value={locale} onValueChange={(v) => setLocale(v as 'pt' | 'en')}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">🇵🇹 Português</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">{t('profile.child_hint')}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl font-display h-12 text-base gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? t('profile.saving') : t('profile.save_avatar')}
        </Button>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2, Gift, Users, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useT } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';

export default function ReferralWidget() {
  const t = useT();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({
    queryKey: ['referral-code', user?.profileId],
    enabled: !!user?.profileId,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data: code } = await supabase
        .from('referral_codes')
        .select('id, code')
        .eq('profile_id', user!.profileId)
        .single();

      if (!code) return null;

      const { count } = await supabase
        .from('referral_claims')
        .select('id', { count: 'exact', head: true })
        .eq('referral_code_id', code.id);

      return { code: code.code, claimCount: count ?? 0 };
    },
  });

  const referralLink = data?.code ? `${window.location.origin}/login?ref=${data.code}` : '';

  const handleCopy = () => {
    if (!data?.code) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: t('referral.copied') });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!data?.code) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('referral.share_title'),
          text: t('referral.share_text'),
          url: referralLink,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  if (!data?.code) return null;

  const bonusEarned = data.claimCount * 100 + (data.claimCount >= 3 ? 100 : 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-accent to-secondary" />
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Gift className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm">{t('referral.title')}</h3>
              <p className="text-[10px] text-muted-foreground">{t('referral.subtitle')}</p>
            </div>
          </div>

          {/* Code display */}
          <div className="bg-muted/50 rounded-2xl p-4 text-center border border-border/30">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{t('referral.your_code')}</p>
            <p className="font-display text-2xl font-bold tracking-[0.3em] text-foreground">{data.code}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="font-display font-bold text-lg">{data.claimCount}</p>
              <p className="text-[10px] text-muted-foreground">{t('referral.friends_invited')}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sparkles className="h-3 w-3 text-accent-foreground" />
              </div>
              <p className="font-display font-bold text-lg">🪙 {bonusEarned}</p>
              <p className="text-[10px] text-muted-foreground">{t('referral.bonus_earned')}</p>
            </div>
          </div>

          {/* Milestone */}
          {data.claimCount < 3 && (
            <div className="bg-accent/10 rounded-xl p-3 flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <p className="text-xs text-muted-foreground">
                {t('referral.milestone_hint').replace('{n}', String(3 - data.claimCount))}
              </p>
            </div>
          )}

          {/* Share buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 rounded-xl font-display gap-1.5 border-border/50" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5 text-secondary" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? t('referral.copied') : t('referral.copy_link')}
            </Button>
            <Button size="sm" className="flex-1 rounded-xl font-display gap-1.5" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5" /> {t('referral.share')}
            </Button>
          </div>

          {/* Link preview */}
          <div className="flex gap-2">
            <Input readOnly value={referralLink} className="rounded-xl border-border/50 text-[10px] bg-muted/30 font-mono" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

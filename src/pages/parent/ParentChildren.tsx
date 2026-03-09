import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { differenceInYears } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CoinDisplay } from '@/components/CoinDisplay';
import { Plus, Edit, Trash2, TrendingUp, Users, Copy, Link2, QrCode, Share2, Check, RefreshCw, Shield, Wallet, Send, CheckCircle2, XCircle, Loader2, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChildren, useUpdateChildBudget, useUpdateChildDailyLimit } from '@/hooks/use-children';
import { usePendingBudgetExceptions, useResolveBudgetException } from '@/hooks/use-budget-exceptions';
import { createNotification } from '@/hooks/use-notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllFeatures, FEATURES } from '@/hooks/use-feature-gate';
import { useSubscriptionTiers } from '@/hooks/use-subscription';
import PaymentSimulator from '@/components/PaymentSimulator';
import { useUpgradeSubscription } from '@/hooks/use-subscription';
import EditChildDialog from '@/components/EditChildDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useT } from '@/contexts/LanguageContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function ParentChildren() {
  const t = useT();
  const { data: children = [], isLoading } = useChildren();
  const { user } = useAuth();
  const qc = useQueryClient();
  const updateBudget = useUpdateChildBudget();
  const updateDailyLimit = useUpdateChildDailyLimit();
  const { data: pendingExceptions = [] } = usePendingBudgetExceptions();
  const resolveException = useResolveBudgetException();
  const totalBalance = children.reduce((s, c) => s + c.balance, 0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteSaving, setInviteSaving] = useState(false);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editChild, setEditChild] = useState<{ childId: string; profileId: string; displayName: string; nickname: string | null; avatar: string; dateOfBirth: string | null } | null>(null);
  const [deleteChild, setDeleteChild] = useState<{ childId: string; displayName: string } | null>(null);
  const deleteChildMutation = useMutation({
    mutationFn: async (childId: string) => {
      const { error } = await supabase.rpc('delete_child_safe', { _child_id: childId } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['children'] });
      toast({ title: t('parent.children.removed'), description: t('parent.children.removed_desc') });
      setDeleteChild(null);
    },
    onError: () => {
      toast({ title: t('common.error'), description: t('parent.children.remove_error'), variant: 'destructive' });
    },
  });
  const { hasFeature, tierName } = useAllFeatures();
  const { data: tiers = [] } = useSubscriptionTiers();
  const { upgrade } = useUpgradeSubscription();
  const hasMultiChild = hasFeature(FEATURES.MULTI_CHILD);

  const currentTier = tiers.find(ti => ti.name === tierName);
  const maxChildren = currentTier?.maxChildren ?? 2;
  const childrenCount = children.length;
  const canAddChild = childrenCount < maxChildren || hasMultiChild;

  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [budgetChild, setBudgetChild] = useState<{ childId: string; profileId: string; displayName: string; monthlyBudget: number; dailySpendLimit: number } | null>(null);
  const [budgetValue, setBudgetValue] = useState('');
  const [dailyLimitValue, setDailyLimitValue] = useState('');

  const openBudgetDialog = (child: typeof budgetChild & {}) => {
    setBudgetChild(child);
    setBudgetValue(String(child.monthlyBudget));
    setDailyLimitValue(String(child.dailySpendLimit));
    setBudgetDialogOpen(true);
  };

  const handleSaveBudget = async () => {
    if (!budgetChild) return;
    const monthlyVal = Number(budgetValue);
    const dailyVal = Number(dailyLimitValue);
    if (isNaN(monthlyVal) || monthlyVal < 0 || isNaN(dailyVal) || dailyVal < 0) return;
    try {
      await Promise.all([
        updateBudget.mutateAsync({ childId: budgetChild.childId, monthlyBudget: monthlyVal }),
        updateDailyLimit.mutateAsync({ childId: budgetChild.childId, dailySpendLimit: dailyVal }),
      ]);
      toast({ title: t('parent.children.limits_updated'), description: `${t('parent.allowance.monthly_freq')}: ${monthlyVal} 🪙 · ${t('parent.tasks.daily')}: ${dailyVal} 🪙` });
      createNotification({
        profileId: budgetChild.profileId,
        title: t('parent.children.limits_updated'),
        message: `${t('parent.children.monthly_limit')}: ${monthlyVal > 0 ? monthlyVal + ' KVC' : '—'} · ${t('parent.children.daily_limit_kvc')}: ${dailyVal} KVC`,
        type: 'vault',
        metadata: { monthlyBudget: monthlyVal, dailySpendLimit: dailyVal },
      });
      setBudgetDialogOpen(false);
    } catch {
      toast({ title: t('common.error'), description: t('parent.children.limits_error'), variant: 'destructive' });
    }
  };

  const inviteLink = `${window.location.origin}/join/${inviteCode}`;

  const handleCopy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast({ title: t('common.copied'), description: type === 'code' ? t('parent.children.code_copied') : t('parent.children.link_copied') });
    setTimeout(() => setCopied(null), 2000);
  };

  const generateAndPersistCode = async () => {
    const newCode = generateCode();
    if (!user?.profileId) {
      setInviteCode(newCode);
      return;
    }
    setInviteSaving(true);
    try {
      // Ensure parent has a household (creates one if missing)
      let householdId = user.householdId;
      if (!householdId) {
        const { data: hId, error: hErr } = await supabase.rpc('ensure_parent_household', { _profile_id: user.profileId } as any);
        if (hErr || !hId) throw new Error('Could not create household');
        householdId = hId as string;
      }
      const { error } = await supabase.from('family_invite_codes').insert({
        code: newCode,
        parent_profile_id: user.profileId,
        household_id: householdId,
      });
      if (error) throw error;
      setInviteCode(newCode);
    } catch {
      toast({ title: t('common.error'), description: t('parent.children.code_error'), variant: 'destructive' });
    } finally {
      setInviteSaving(false);
    }
  };

  const handleRegenerate = () => {
    generateAndPersistCode();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: t('parent.children.join_family'), text: t('parent.children.join_desc'), url: inviteLink });
      } catch {}
    } else {
      handleCopy(inviteLink, 'link');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl gradient-kivara p-6 text-primary-foreground">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/4 w-60 h-20 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider font-medium">{t('parent.children.management')}</p>
            <h1 className="font-display text-2xl font-bold mt-1">{t('parent.children.title')}</h1>
            <p className="text-sm text-primary-foreground/60 mt-1">{t('parent.children.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-2xl font-display gap-1.5 bg-white/15 hover:bg-white/25 text-primary-foreground border-0 backdrop-blur-sm shadow-lg text-xs sm:text-sm" onClick={async () => {
              if (!canAddChild) { setPaymentOpen(true); return; }
              await generateAndPersistCode();
              setInviteOpen(true);
            }}>
              <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {t('parent.children.invite')}
            </Button>
            <Button size="sm" className="rounded-2xl font-display gap-1.5 bg-white/15 hover:bg-white/25 text-primary-foreground border-0 backdrop-blur-sm shadow-lg text-xs sm:text-sm" onClick={async () => {
              if (!canAddChild) { setPaymentOpen(true); return; }
              await generateAndPersistCode();
              setInviteOpen(true);
            }}>
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {t('parent.children.add')}
            </Button>
          </div>
        </div>
        <div className="relative flex flex-wrap items-center gap-2 sm:gap-4 mt-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2">
            <Users className="h-4 w-4" />
            <span className="font-display font-bold text-base sm:text-lg">{children.length}</span>
            <span className="text-[10px] sm:text-xs text-primary-foreground/60">/ {maxChildren} {t('parent.children.max_children')}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="font-display font-bold text-base sm:text-lg">🪙 {totalBalance}</span>
            <span className="text-[10px] sm:text-xs text-primary-foreground/60">{t('parent.children.total_balance')}</span>
          </div>
          {!canAddChild && (
            <div className="flex items-center gap-2 bg-accent/20 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => setPaymentOpen(true)}>
              <Crown className="h-4 w-4 text-accent-foreground" />
              <span className="text-[10px] sm:text-xs text-accent-foreground font-semibold">{t('parent.children.upgrade_more')}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pending Budget Exceptions */}
      {pendingExceptions.length > 0 && hasFeature(FEATURES.BUDGET_EXCEPTIONS) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-chart-1/30 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-chart-1 to-accent" />
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-chart-1/10 flex items-center justify-center">
                  <Send className="h-3.5 w-3.5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm font-display font-bold">{t('parent.children.budget_exceptions')}</p>
                  <p className="text-[10px] text-muted-foreground">{pendingExceptions.length} {t('parent.children.pending_requests')}</p>
                </div>
              </div>
              {pendingExceptions.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-3 bg-muted/40 rounded-xl p-3 border border-border/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl">{req.reward_icon || '🎁'}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-display font-bold truncate">{req.child_name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {req.reward_name} — 🪙 {req.amount}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl h-8 px-2.5 text-xs font-display gap-1 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => resolveException.mutate({ requestId: req.id, action: 'reject' })}
                      disabled={resolveException.isPending}
                    >
                      {resolveException.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-xl h-8 px-2.5 text-xs font-display gap-1"
                      onClick={() => resolveException.mutate({ requestId: req.id, action: 'approve' })}
                      disabled={resolveException.isPending}
                    >
                      {resolveException.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                      {t('common.approve')}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Children Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="overflow-hidden border-border/50">
              <div className="h-1 gradient-kivara" />
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-20 rounded-2xl" />
                  <Skeleton className="h-20 rounded-2xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : children.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <div className="text-5xl mb-4">👶</div>
            <h3 className="font-display font-bold text-lg mb-2">{t('parent.children.no_children')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('parent.children.add_hint')}</p>
            <Button className="rounded-xl font-display gap-1.5" onClick={async () => { await generateAndPersistCode(); setInviteOpen(true); }}>
              <Link2 className="h-4 w-4" /> {t('parent.children.invite_child')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
          {children.map((child) => (
            <motion.div key={child.childId} variants={item} whileHover={{ y: -4 }}>
              <Card className="group hover:shadow-kivara transition-all duration-300 overflow-hidden border-border/50">
                <div className="h-1 gradient-kivara" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--kivara-light-blue))] to-[hsl(var(--kivara-light-green))] flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                      {child.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg">{child.displayName}</h3>
                      {child.nickname && (
                        <p className="text-xs text-muted-foreground">{t('parent.children.nickname')}: {child.nickname}</p>
                      )}
                      {child.dateOfBirth && (
                        <p className="text-xs text-muted-foreground">{differenceInYears(new Date(), new Date(child.dateOfBirth))} {t('common.years')}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <div className="bg-[hsl(var(--kivara-light-blue))] rounded-2xl p-3.5 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{t('parent.children.balance')}</p>
                      <CoinDisplay amount={child.balance} size="sm" />
                    </div>
                    <div
                      className="bg-muted/50 rounded-2xl p-3.5 text-center cursor-pointer hover:bg-muted/80 transition-colors group/budget"
                      onClick={() => openBudgetDialog({ childId: child.childId, profileId: child.profileId, displayName: child.displayName, monthlyBudget: child.monthlyBudget, dailySpendLimit: child.dailySpendLimit })}
                    >
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center justify-center gap-1">
                        <Wallet className="h-3 w-3" /> {t('parent.children.monthly_limit')}
                      </p>
                      <p className="font-display font-bold text-lg text-foreground">
                        {child.monthlyBudget > 0 ? `${child.monthlyBudget} 🪙` : <span className="text-muted-foreground text-sm">{t('parent.children.set_limit')}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="flex-1 min-w-[100px] rounded-xl font-display gap-1.5 border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-xs sm:text-sm" onClick={() => {
                      setEditChild({ childId: child.childId, profileId: child.profileId, displayName: child.displayName, nickname: child.nickname, avatar: child.avatar, dateOfBirth: child.dateOfBirth });
                      setEditOpen(true);
                    }}>
                      <Edit className="h-3.5 w-3.5" /> {t('parent.children.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[100px] rounded-xl font-display gap-1.5 border-border/50 hover:bg-accent hover:text-accent-foreground transition-all duration-200 text-xs sm:text-sm"
                      onClick={() => openBudgetDialog({ childId: child.childId, profileId: child.profileId, displayName: child.displayName, monthlyBudget: child.monthlyBudget, dailySpendLimit: child.dailySpendLimit })}
                    >
                      <Wallet className="h-3.5 w-3.5" /> {t('parent.children.limit')}
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl border-border/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 h-9 w-9" onClick={() => setDeleteChild({ childId: child.childId, displayName: child.displayName })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--kivara-light-blue))] flex items-center justify-center">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              {t('parent.children.invite_child')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('parent.children.share_desc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('parent.children.invite_code')}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted/50 rounded-2xl p-4 text-center border border-border/30">
                  <motion.p key={inviteCode} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-3xl font-bold tracking-[0.3em] text-foreground">
                    {inviteCode}
                  </motion.p>
                  <p className="text-[10px] text-muted-foreground mt-1">{t('parent.children.valid_48h')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl font-display gap-1.5 border-border/50" onClick={() => handleCopy(inviteCode, 'code')}>
                  <AnimatePresence mode="wait">
                    {copied === 'code' ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="h-3.5 w-3.5 text-secondary" /></motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy className="h-3.5 w-3.5" /></motion.div>
                    )}
                  </AnimatePresence>
                  {copied === 'code' ? t('parent.children.copied') : t('parent.children.copy_code')}
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl font-display gap-1.5 border-border/50" onClick={handleRegenerate}>
                  <RefreshCw className="h-3.5 w-3.5" /> {t('parent.children.new_code')}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('parent.children.or')}</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t('parent.children.invite_link')}</p>
              <div className="flex gap-2">
                <Input readOnly value={inviteLink} className="rounded-xl border-border/50 text-xs bg-muted/30 font-mono" />
                <Button variant="outline" size="icon" className="rounded-xl border-border/50 shrink-0" onClick={() => handleCopy(inviteLink, 'link')}>
                  {copied === 'link' ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button className="w-full rounded-xl font-display gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> {t('parent.children.share_invite')}
            </Button>
            <div className="bg-[hsl(var(--kivara-light-gold))] rounded-2xl p-4 flex items-start gap-3">
              <QrCode className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-display font-bold text-accent-foreground">{t('parent.children.how_works')}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  {t('parent.children.how_works_desc')}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Budget & Daily Limit Dialog */}
      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              {t('parent.children.spend_limits')}
            </DialogTitle>
            <DialogDescription>
              {t('parent.children.spend_limits_desc')} {budgetChild?.displayName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-display font-bold">{t('parent.children.monthly_limit_kvc')}</Label>
              <Input
                type="number"
                placeholder="Ex: 500"
                value={budgetValue}
                onChange={e => setBudgetValue(e.target.value)}
                min={0}
                className="rounded-xl text-lg font-display text-center"
              />
              <div className="flex gap-2 flex-wrap justify-center">
                {[100, 250, 500, 1000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBudgetValue(String(v))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
                      budgetValue === String(v)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {v} 🪙
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                {t('parent.children.set_0_remove')}
              </p>
            </div>

            <div className="h-px bg-border/50" />

            <div className="space-y-2">
              <Label className="text-xs font-display font-bold">{t('parent.children.daily_limit_kvc')}</Label>
              <Input
                type="number"
                placeholder="Ex: 50"
                value={dailyLimitValue}
                onChange={e => setDailyLimitValue(e.target.value)}
                min={0}
                className="rounded-xl text-lg font-display text-center"
              />
              <div className="flex gap-2 flex-wrap justify-center">
                {[20, 50, 100, 200].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDailyLimitValue(String(v))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
                      dailyLimitValue === String(v)
                        ? 'bg-secondary text-secondary-foreground shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {v} 🪙
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                {t('parent.children.max_daily')}
              </p>
            </div>

            <Button
              className="w-full rounded-xl font-display gap-2"
              onClick={handleSaveBudget}
              disabled={updateBudget.isPending || updateDailyLimit.isPending}
            >
              <Wallet className="h-4 w-4" />
              {(updateBudget.isPending || updateDailyLimit.isPending) ? t('parent.children.saving_limits') : t('parent.children.save_limits')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Payment for extra children */}
      <PaymentSimulator
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        currentTierName={tierName}
        tiers={tiers.filter(ti => ti.tierType === 'free' || ti.tierType === 'family_premium')}
        onConfirmUpgrade={upgrade}
      />

      {/* Edit Child Dialog */}
      <EditChildDialog open={editOpen} onOpenChange={setEditOpen} child={editChild} />

      {/* Delete Child Confirmation */}
      <AlertDialog open={!!deleteChild} onOpenChange={(open) => !open && setDeleteChild(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">{t('parent.children.remove_child')} {deleteChild?.displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              {t('parent.children.remove_confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-display">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl font-display bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteChildMutation.isPending}
              onClick={() => deleteChild && deleteChildMutation.mutate(deleteChild.childId)}
            >
              {deleteChildMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {t('parent.children.remove_child')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

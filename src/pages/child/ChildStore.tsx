import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kivo } from '@/components/Kivo';
import { ShoppingBag, Gift, Star, Loader2, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useWalletBalance } from '@/hooks/use-wallet';
import { useChildRewards, useClaimReward } from '@/hooks/use-child-rewards';
import { useTeenBudget } from '@/hooks/use-teen-budget';
import { useMonthlySpending } from '@/hooks/use-monthly-spending';
import { useRequestBudgetException } from '@/hooks/use-budget-exceptions';
import { useAuth } from '@/contexts/AuthContext';
import { useAllFeatures, FEATURES } from '@/hooks/use-feature-gate';
import { createNotification } from '@/hooks/use-notifications';
import { useT } from '@/contexts/LanguageContext';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ChildStore() {
  const t = useT();
  const { user } = useAuth();
  const { data: walletData, isLoading: loadingWallet } = useWalletBalance();
  const { data: rewards = [], isLoading: loadingRewards } = useChildRewards();
  const { data: monthlyBudget = 0 } = useTeenBudget();
  const { data: monthlySpent = 0 } = useMonthlySpending();
  const claimReward = useClaimReward();
  const requestException = useRequestBudgetException();
  const { hasFeature } = useAllFeatures();
  const hasBudgetExceptions = hasFeature(FEATURES.BUDGET_EXCEPTIONS);

  const [confirmReward, setConfirmReward] = useState<{ id: string; name: string; price: number } | null>(null);
  const [exceptionReward, setExceptionReward] = useState<{ id: string; name: string; price: number; parentProfileId: string } | null>(null);

  const categoryLabels: Record<string, string> = {
    experience: t('child.store.cat.experience'),
    privilege: t('child.store.cat.privilege'),
    physical: t('child.store.cat.physical'),
    digital: t('child.store.cat.digital'),
  };

  const categoryColors: Record<string, string> = {
    experience: 'bg-primary/10 text-primary border-primary/20',
    privilege: 'bg-accent/10 text-accent-foreground border-accent/20',
    physical: 'bg-secondary/10 text-secondary border-secondary/20',
    digital: 'bg-muted text-muted-foreground border-muted',
  };

  const balance = Number(walletData?.balance) || 0;
  const isLoading = loadingWallet || loadingRewards;
  const budgetRemaining = monthlyBudget > 0 ? monthlyBudget - monthlySpent : Infinity;
  const budgetPct = monthlyBudget > 0 ? Math.min((monthlySpent / monthlyBudget) * 100, 100) : 0;

  const handleClaim = () => {
    if (!confirmReward) return;
    claimReward.mutate(confirmReward, { onSettled: () => setConfirmReward(null) });
  };

  const handleRequestException = () => {
    if (!exceptionReward || !user?.profileId) return;
    requestException.mutate(
      { childProfileId: user.profileId, parentProfileId: exceptionReward.parentProfileId, rewardId: exceptionReward.id, amount: exceptionReward.price },
      {
        onSuccess: () => {
          createNotification({
            profileId: exceptionReward.parentProfileId,
            title: '📩 Pedido de exceção ao limite',
            message: `${user.name || 'O teu filho(a)'} pediu autorização para resgatar "${exceptionReward.name}" (${exceptionReward.price} KVC), que excede o limite mensal.`,
            type: 'task', urgent: true,
            metadata: { reward_id: exceptionReward.id, child_profile_id: user.profileId },
          });
          setExceptionReward(null);
        },
        onSettled: () => setExceptionReward(null),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
          <CardContent className="p-5 sm:p-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h1 className="font-display text-lg sm:text-xl font-bold">{t('child.store.title')}</h1>
                  <p className="text-small opacity-80">{t('child.store.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 w-fit">
                <span className="text-lg">🪙</span>
                {loadingWallet ? <Skeleton className="h-6 w-10 bg-white/20" /> : <span className="font-display font-bold text-lg">{balance}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Budget */}
      {monthlyBudget > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-display font-bold">{t('child.store.monthly_limit')}</span>
                <span className={`font-display font-bold ${budgetPct >= 100 ? 'text-destructive' : budgetPct >= 80 ? 'text-warning' : 'text-muted-foreground'}`}>
                  🪙 {monthlySpent} / {monthlyBudget}
                </span>
              </div>
              <Progress value={budgetPct} className="h-2" />
              {budgetPct >= 100 && <p className="text-xs text-destructive font-display">{t('child.store.limit_reached')}</p>}
              {budgetPct >= 80 && budgetPct < 100 && (
                <p className="text-xs text-muted-foreground font-display">{t('child.store.almost_limit')} {Math.floor(budgetRemaining)} 🪙</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Rewards */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-accent-foreground" />
          <span className="font-display font-bold">{t('child.store.available_rewards')}</span>
        </div>
        <p className="text-xs text-muted-foreground">{t('child.store.rewards_by_parent')}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : rewards.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-3xl mx-auto mb-4">🎁</div>
            <p className="font-display font-bold text-sm">{t('child.store.no_rewards')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('child.store.no_rewards_hint')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rewards.map((reward, i) => {
            const canAfford = balance >= reward.price;
            const withinBudget = budgetRemaining >= reward.price;
            const canBuy = canAfford && withinBudget;
            const canRequestException = canAfford && !withinBudget && monthlyBudget > 0 && hasBudgetExceptions;
            return (
              <motion.div key={reward.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, type: 'spring' as const, stiffness: 300, damping: 30 }}>
                <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="h-0.5 bg-gradient-to-r from-accent to-primary" />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl shrink-0">{reward.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-display font-bold text-sm">{reward.name}</h3>
                          <Badge variant="outline" className={`text-xs ${categoryColors[reward.category] ?? categoryColors.digital}`}>
                            {categoryLabels[reward.category] ?? reward.category}
                          </Badge>
                        </div>
                        {reward.description && <p className="text-xs text-muted-foreground line-clamp-2">{reward.description}</p>}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-border/30">
                      <span className="font-display font-bold text-sm">🪙 {reward.price}</span>
                      <div className="flex gap-1.5">
                        {canRequestException && (
                          <Button size="sm" variant="outline" className="rounded-xl text-xs font-display h-8 px-3 gap-1 border-chart-1/30 text-chart-1 hover:bg-chart-1/10"
                            onClick={() => setExceptionReward({ id: reward.id, name: reward.name, price: reward.price, parentProfileId: reward.parentProfileId })}
                            disabled={requestException.isPending}
                          >
                            <Send className="h-3 w-3" /> {t('child.store.request')}
                          </Button>
                        )}
                        <Button size="sm" className="rounded-xl text-xs font-display h-8 px-4 gap-1 transition-all"
                          onClick={() => setConfirmReward({ id: reward.id, name: reward.name, price: reward.price })}
                          disabled={!canBuy || claimReward.isPending}
                          variant={canBuy ? 'default' : 'secondary'}
                        >
                          {claimReward.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Gift className="h-3 w-3" />}
                          {canBuy ? t('child.store.redeem') : !canAfford ? t('child.store.no_balance') : t('child.store.limit')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmReward} onOpenChange={(open) => !open && setConfirmReward(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">{t('child.store.confirm_redeem')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('child.store.confirm_redeem_desc')} <strong>"{confirmReward?.name}"</strong> {t('child.store.by')} <strong>🪙 {confirmReward?.price} KVC</strong>?
              {confirmReward && (
                <>
                  <span className="block mt-2 text-xs">{t('child.store.current_balance')}: {balance} KVC → {t('child.store.new_balance')}: {balance - confirmReward.price} KVC</span>
                  {monthlyBudget > 0 && (
                    <span className="block mt-1 text-xs">{t('child.store.monthly_limit')}: {monthlySpent} + {confirmReward.price} = {monthlySpent + confirmReward.price} / {monthlyBudget} KVC</span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-display">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl font-display gap-1.5" onClick={handleClaim} disabled={claimReward.isPending}>
              {claimReward.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gift className="h-3.5 w-3.5" />}
              {t('child.store.confirm_btn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exception Request Dialog */}
      <AlertDialog open={!!exceptionReward} onOpenChange={(open) => !open && setExceptionReward(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">{t('child.store.request_parent')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('child.store.request_desc')} <strong>"{exceptionReward?.name}"</strong> {t('child.store.costs')} <strong>🪙 {exceptionReward?.price} KVC</strong> {t('child.store.budget_remaining')} <strong>🪙 {Math.max(Math.floor(budgetRemaining), 0)} KVC</strong>.
              <span className="block mt-2 text-xs">{t('child.store.request_exception')}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-display">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl font-display gap-1.5" onClick={handleRequestException} disabled={requestException.isPending}>
              {requestException.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {t('child.store.send_request')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Kivo page="store" />
    </div>
  );
}

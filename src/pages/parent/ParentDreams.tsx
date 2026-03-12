import { useState } from 'react';
import { useDreamVaults, useAddDreamComment, useDepositToDream, DreamVault } from '@/hooks/use-dream-vaults';
import { useChildren } from '@/hooks/use-children';
import { useT } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, MessageCircle, PiggyBank, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const EMOJI_OPTIONS = ['💬', '❤️', '🌟', '💪', '🎉', '👏'];

function DreamCard({ dream }: { dream: DreamVault }) {
  const t = useT();
  const addComment = useAddDreamComment();
  const deposit = useDepositToDream();
  const [commentText, setCommentText] = useState('');
  const [commentEmoji, setCommentEmoji] = useState('💬');
  const [depositAmount, setDepositAmount] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  const pct = dream.targetAmount > 0 ? Math.min(100, Math.round((dream.currentAmount / dream.targetAmount) * 100)) : 0;

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate(
      { dreamVaultId: dream.id, text: commentText.trim(), emoji: commentEmoji },
      {
        onSuccess: () => {
          toast.success(t('dreams.comment_sent'));
          setCommentText('');
          setCommentOpen(false);
        },
        onError: () => toast.error(t('common.error')),
      }
    );
  };

  const handleDeposit = () => {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) return;
    deposit.mutate(
      { dreamId: dream.id, amount },
      {
        onSuccess: () => {
          toast.success(t('dreams.deposit_success'));
          setDepositAmount('');
          setDepositOpen(false);
        },
        onError: () => toast.error(t('common.error')),
      }
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{dream.icon}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-bold text-sm truncate">{dream.title}</h4>
            {dream.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{dream.description}</p>
            )}
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            dream.priority === 'high' ? 'bg-destructive/10 text-destructive' :
            dream.priority === 'medium' ? 'bg-amber-500/10 text-amber-600' :
            'bg-muted text-muted-foreground'
          }`}>
            {dream.priority === 'high' ? '🔥' : dream.priority === 'medium' ? '⭐' : '💤'}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{dream.currentAmount} / {dream.targetAmount}</span>
            <span className="font-semibold text-primary">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        <div className="flex gap-2">
          <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs rounded-xl">
                <MessageCircle className="h-3.5 w-3.5" />
                {t('dreams.comment')}
                {dream.parentComments.length > 0 && (
                  <span className="ml-1 bg-primary/10 text-primary px-1.5 rounded-full text-xs">
                    {dream.parentComments.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {t('dreams.send_encouragement')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex gap-1.5">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setCommentEmoji(e)}
                      className={`text-xl p-1.5 rounded-lg transition-all ${commentEmoji === e ? 'bg-primary/15 scale-110' : 'hover:bg-muted'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('dreams.comment_placeholder')}
                  rows={3}
                />
                <Button onClick={handleComment} disabled={addComment.isPending || !commentText.trim()} className="w-full gap-2 rounded-xl">
                  <Send className="h-4 w-4" />
                  {t('dreams.send')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="flex-1 gap-1.5 text-xs rounded-xl">
                <PiggyBank className="h-3.5 w-3.5" />
                {t('dreams.deposit')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  {t('dreams.deposit_to')} "{dream.title}"
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  type="number"
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder={t('dreams.amount_placeholder')}
                />
                <Button onClick={handleDeposit} disabled={deposit.isPending || !Number(depositAmount)} className="w-full gap-2 rounded-xl">
                  <PiggyBank className="h-4 w-4" />
                  {t('dreams.confirm_deposit')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {dream.parentComments.length > 0 && (
          <div>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showComments ? t('dreams.hide_comments') : t('dreams.show_comments')} ({dream.parentComments.length})
            </button>
            {showComments && (
              <div className="mt-2 space-y-1.5">
                {dream.parentComments.map((c) => (
                  <div key={c.id} className="flex gap-2 items-start text-xs bg-muted/50 rounded-xl p-2">
                    <span>{c.emoji}</span>
                    <p className="flex-1 text-foreground">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ParentDreams() {
  const t = useT();
  const { data: dreams, isLoading: dreamsLoading } = useDreamVaults();
  const { data: children, isLoading: childrenLoading } = useChildren();

  const isLoading = dreamsLoading || childrenLoading;

  // Group dreams by profileId
  const grouped = (children ?? []).map((child) => ({
    child,
    dreams: (dreams ?? []).filter((d) => d.profileId === child.profileId),
  })).filter((g) => g.dreams.length > 0);

  const orphanDreams = (dreams ?? []).filter(
    (d) => !(children ?? []).some((c) => c.profileId === d.profileId)
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold">{t('dreams.parent_title')}</h1>
          <p className="text-sm text-muted-foreground">{t('dreams.parent_subtitle')}</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && grouped.length === 0 && orphanDreams.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t('dreams.no_dreams')}</p>
          </CardContent>
        </Card>
      )}

      {grouped.map(({ child, dreams }) => (
        <motion.section
          key={child.profileId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{child.avatar}</span>
            <h2 className="font-display font-bold text-base">{child.displayName}</h2>
            <span className="text-xs text-muted-foreground">({dreams.length})</span>
          </div>
          <div className="grid gap-3">
            {dreams.map((dream) => (
              <DreamCard key={dream.id} dream={dream} />
            ))}
          </div>
        </motion.section>
      ))}

      {orphanDreams.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-bold text-base text-muted-foreground">{t('dreams.other')}</h2>
          <div className="grid gap-3">
            {orphanDreams.map((dream) => (
              <DreamCard key={dream.id} dream={dream} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

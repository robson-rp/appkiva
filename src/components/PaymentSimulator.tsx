import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, CreditCard, Check, Sparkles, Shield, Loader2, Smartphone, FileText, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenantCurrency } from '@/components/CurrencyDisplay';
import { useExchangeRates, formatPrice } from '@/hooks/use-exchange-rates';
import { useRegionalPrices, getRegionalPrice } from '@/hooks/use-regional-prices';
import { useT } from '@/contexts/LanguageContext';

interface SubscriptionTier {
  id: string; name: string; tierType: string; priceMonthly: number; priceYearly: number; features: string[]; maxChildren: number;
}

interface PaymentSimulatorProps {
  open: boolean; onOpenChange: (open: boolean) => void; currentTierName?: string | null; tiers: SubscriptionTier[]; onConfirmUpgrade: (tierId: string) => Promise<void>;
}

const FEATURE_LABELS: Record<string, string> = {
  savings_vaults: 'Cofres de Poupança', dream_vaults: 'Cofres de Sonhos', custom_rewards: 'Recompensas Personalizadas',
  budget_exceptions: 'Exceções de Orçamento', multi_child: 'Multi-Criança (até 10)', advanced_analytics: 'Relatórios Avançados',
  export_reports: 'Exportar Relatórios', real_money_wallet: 'Carteira Dinheiro Real', classroom_mode: 'Modo Sala de Aula', priority_support: 'Suporte Prioritário',
};

type Step = 'select' | 'payment' | 'processing' | 'success';
type PaymentMethod = 'referencia' | 'multicaixa_express' | 'credit_card' | 'paypal' | 'stripe';

function generateReference(): string {
  return Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
}

export default function PaymentSimulator({ open, onOpenChange, currentTierName, tiers, onConfirmUpgrade }: PaymentSimulatorProps) {
  const t = useT();
  const [step, setStep] = useState<Step>('select');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mockReference] = useState(() => generateReference());

  const { data: tenantCurrency } = useTenantCurrency();
  const { data: rates = [] } = useExchangeRates();
  const { data: regionalPrices = [] } = useRegionalPrices();

  const currencySymbol = tenantCurrency?.symbol ?? 'Kz';
  const currencyCode = tenantCurrency?.code ?? 'AOA';
  const decimals = tenantCurrency?.decimalPlaces ?? 0;
  const isAngola = currencyCode === 'AOA';

  const availableMethods = isAngola
    ? [
        { id: 'referencia' as PaymentMethod, label: t('payment.referencia'), icon: <FileText className="h-5 w-5" />, description: t('payment.referencia_desc') },
        { id: 'multicaixa_express' as PaymentMethod, label: t('payment.multicaixa'), icon: <Smartphone className="h-5 w-5" />, description: t('payment.multicaixa_desc') },
      ]
    : [
        { id: 'credit_card' as PaymentMethod, label: t('payment.credit_card'), icon: <CreditCard className="h-5 w-5" />, description: t('payment.credit_card_desc') },
        { id: 'paypal' as PaymentMethod, label: t('payment.paypal_label'), icon: <Globe className="h-5 w-5" />, description: t('payment.paypal_desc') },
        { id: 'stripe' as PaymentMethod, label: t('payment.stripe_label'), icon: <CreditCard className="h-5 w-5" />, description: t('payment.stripe_method_desc') },
      ];

  const fmtTierPrice = (tierId: string, usdAmount: number, field: 'price_monthly' | 'price_yearly' = 'price_monthly') =>
    formatPrice(getRegionalPrice(tierId, field, usdAmount, currencyCode, regionalPrices, rates), currencySymbol, decimals);

  const currentPrice = useMemo(() => {
    if (!selectedTier) return '';
    const amount = billing === 'monthly' ? selectedTier.priceMonthly : selectedTier.priceYearly;
    const field = billing === 'monthly' ? 'price_monthly' : 'price_yearly';
    return fmtTierPrice(selectedTier.id, amount, field);
  }, [selectedTier, billing, currencyCode, regionalPrices, rates]);

  const reset = () => { setStep('select'); setSelectedTier(null); setSelectedMethod(null); setCardNumber(''); setCardExpiry(''); setCardCvc(''); setCardName(''); setPhoneNumber(''); };
  const handleClose = (o: boolean) => { if (!o) reset(); onOpenChange(o); };
  const formatCardNumber = (val: string) => { const d = val.replace(/\D/g, '').slice(0, 16); return d.replace(/(\d{4})(?=\d)/g, '$1 '); };
  const formatExpiry = (val: string) => { const d = val.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };
  const formatPhone = (val: string) => val.replace(/\D/g, '').slice(0, 9);

  const isFormValid = useMemo(() => {
    if (!selectedMethod) return false;
    switch (selectedMethod) {
      case 'credit_card': return cardNumber.replace(/\s/g, '').length === 16 && cardExpiry.length === 5 && cardCvc.length >= 3 && cardName.length >= 2;
      case 'multicaixa_express': return phoneNumber.length === 9 && phoneNumber.startsWith('9');
      case 'referencia': case 'paypal': case 'stripe': return true;
      default: return false;
    }
  }, [selectedMethod, cardNumber, cardExpiry, cardCvc, cardName, phoneNumber]);

  const handlePay = async () => {
    if (!selectedTier) return;
    setStep('processing');
    await new Promise((r) => setTimeout(r, 2200));
    try { await onConfirmUpgrade(selectedTier.id); setStep('success'); } catch { setStep('payment'); }
  };

  const upgradeTiers = tiers.filter((ti) => ti.name !== currentTierName && ti.priceMonthly >= 0);

  const payButtonLabel = useMemo(() => {
    if (!selectedMethod) return t('payment.pay');
    switch (selectedMethod) {
      case 'referencia': return t('payment.confirm_pay');
      case 'multicaixa_express': return `${t('payment.pay')} ${currentPrice}`;
      case 'paypal': return t('payment.go_paypal');
      case 'stripe': return t('payment.go_stripe');
      case 'credit_card': return `${t('payment.pay')} ${currentPrice}`;
      default: return t('payment.pay');
    }
  }, [selectedMethod, currentPrice, t]);

  const renderPaymentForm = () => {
    if (!selectedMethod) return null;
    switch (selectedMethod) {
      case 'credit_card':
        return (
          <div className="space-y-4">
            <div><Label className="text-xs font-medium">{t('payment.card_name')}</Label><Input placeholder="João Silva" value={cardName} onChange={(e) => setCardName(e.target.value)} className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs font-medium">{t('payment.card_number')}</Label><Input placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} className="rounded-xl mt-1 font-mono" maxLength={19} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-medium">{t('payment.card_expiry')}</Label><Input placeholder="12/26" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} className="rounded-xl mt-1 font-mono" maxLength={5} /></div>
              <div><Label className="text-xs font-medium">{t('payment.card_cvc')}</Label><Input placeholder="123" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} className="rounded-xl mt-1 font-mono" maxLength={4} /></div>
            </div>
          </div>
        );
      case 'multicaixa_express':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">{t('payment.phone')}</Label>
              <Input placeholder="9XX XXX XXX" value={phoneNumber} onChange={(e) => setPhoneNumber(formatPhone(e.target.value))} className="rounded-xl mt-1 font-mono" maxLength={9} />
              <p className="text-xs text-muted-foreground mt-1">{t('payment.phone_hint')}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">{t('payment.amount_label')}</p>
              <p className="font-display font-bold text-xl text-primary mt-1">{currentPrice}</p>
            </div>
          </div>
        );
      case 'referencia':
        return (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{t('payment.entity')}</span><span className="font-mono font-bold text-sm">11456</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{t('payment.reference')}</span><span className="font-mono font-bold text-sm">{mockReference}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{t('payment.amount')}</span><span className="font-display font-bold text-primary">{currentPrice}</span></div>
            </div>
            <p className="text-xs text-muted-foreground text-center">{t('payment.ref_hint')}</p>
          </div>
        );
      case 'paypal':
        return (<div className="bg-muted/50 rounded-xl p-6 text-center space-y-2"><Globe className="h-8 w-8 mx-auto text-primary" /><p className="font-display font-bold text-sm">{t('payment.redirect_paypal')}</p><p className="text-xs text-muted-foreground">{t('payment.redirect_paypal_desc')} <span className="font-bold text-foreground">{currentPrice}</span></p></div>);
      case 'stripe':
        return (<div className="bg-muted/50 rounded-xl p-6 text-center space-y-2"><CreditCard className="h-8 w-8 mx-auto text-primary" /><p className="font-display font-bold text-sm">{t('payment.stripe_title')}</p><p className="text-xs text-muted-foreground">{t('payment.stripe_desc')} <span className="font-bold text-foreground">{currentPrice}</span></p></div>);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6">
              <DialogHeader><DialogTitle className="font-display flex items-center gap-2"><Crown className="h-5 w-5 text-accent-foreground" />{t('payment.choose_plan')}</DialogTitle></DialogHeader>
              <div className="flex items-center justify-center gap-2 mt-4 mb-5">
                <button onClick={() => setBilling('monthly')} className={cn('px-4 py-1.5 rounded-full text-xs font-semibold transition-all', billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{t('payment.monthly')}</button>
                <button onClick={() => setBilling('yearly')} className={cn('px-4 py-1.5 rounded-full text-xs font-semibold transition-all', billing === 'yearly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{t('payment.yearly')} <span className="text-xs ml-1 opacity-70">{t('payment.yearly_save')}</span></button>
              </div>
              <div className="space-y-3">
                {upgradeTiers.map((tier) => {
                  const price = billing === 'monthly' ? tier.priceMonthly : tier.priceYearly;
                  const period = billing === 'monthly' ? t('payment.per_month') : t('payment.per_year');
                  return (
                    <motion.div key={tier.id} whileTap={{ scale: 0.98 }}>
                      <Card className={cn('cursor-pointer border-2 transition-all hover:shadow-md', selectedTier?.id === tier.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border/50 hover:border-primary/30')} onClick={() => setSelectedTier(tier)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-display font-bold text-sm">{tier.name}</h3>
                            <span className="font-display font-bold text-lg text-primary">{fmtTierPrice(tier.id, price, billing === 'monthly' ? 'price_monthly' : 'price_yearly')}<span className="text-xs text-muted-foreground font-normal">{period}</span></span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {tier.features.slice(0, 5).map((f) => (<span key={f} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{FEATURE_LABELS[f] ?? f}</span>))}
                            {tier.features.length > 5 && (<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">+{tier.features.length - 5} {t('payment.more')}</span>)}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              <Button className="w-full mt-5 rounded-xl font-display gap-2" disabled={!selectedTier} onClick={() => { setSelectedMethod(null); setStep('payment'); }}><CreditCard className="h-4 w-4" />{t('payment.continue')}</Button>
            </motion.div>
          )}

          {step === 'payment' && selectedTier && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-6">
              <DialogHeader><DialogTitle className="font-display flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />{t('payment.title')}<span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full font-medium ml-auto">{t('payment.simulator')}</span></DialogTitle></DialogHeader>
              <div className="bg-muted/50 rounded-xl p-3 mt-4 mb-4 flex items-center justify-between">
                <div><p className="text-xs text-muted-foreground">{t('payment.selected_plan')}</p><p className="font-display font-bold text-sm">{selectedTier.name}</p></div>
                <p className="font-display font-bold text-primary">{currentPrice}<span className="text-xs text-muted-foreground font-normal">/{billing === 'monthly' ? t('payment.per_month').replace('/', '') : t('payment.per_year').replace('/', '')}</span></p>
              </div>
              <div className="space-y-2 mb-4">
                <Label className="text-xs font-medium text-muted-foreground">{t('payment.method')}</Label>
                <div className="grid grid-cols-1 gap-2">
                  {availableMethods.map((method) => (
                    <button key={method.id} onClick={() => setSelectedMethod(method.id)} className={cn('flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left', selectedMethod === method.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30')}>
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', selectedMethod === method.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{method.icon}</div>
                      <div className="min-w-0"><p className="font-display font-bold text-xs">{method.label}</p><p className="text-xs text-muted-foreground">{method.description}</p></div>
                    </button>
                  ))}
                </div>
              </div>
              {selectedMethod && (<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">{renderPaymentForm()}</motion.div>)}
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Shield className="h-3.5 w-3.5" /><span>{t('payment.secure_note')}</span></div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="rounded-xl font-display" onClick={() => setStep('select')}>{t('payment.back')}</Button>
                <Button className="flex-1 rounded-xl font-display gap-2" disabled={!selectedMethod || !isFormValid} onClick={handlePay}><Crown className="h-4 w-4" />{payButtonLabel}</Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-12 flex flex-col items-center justify-center text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader2 className="h-10 w-10 text-primary" /></motion.div>
              <p className="font-display font-bold text-sm mt-4">{t('payment.processing')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('payment.wait')}</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-10 flex flex-col items-center justify-center text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }} className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4"><Check className="h-8 w-8 text-secondary" /></motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 className="font-display font-bold text-lg">{t('payment.success')}</h3>
                <p className="text-sm text-muted-foreground mt-2">{t('payment.success_desc')} <span className="font-bold text-foreground">{selectedTier?.name}</span>.</p>
                <p className="text-xs text-muted-foreground mt-1">{t('payment.success_features')}</p>
              </motion.div>
              <Button className="mt-6 rounded-xl font-display gap-2" onClick={() => { handleClose(false); window.location.reload(); }}><Sparkles className="h-4 w-4" />{t('payment.explore')}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

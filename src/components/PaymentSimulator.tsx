import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, CreditCard, Check, Sparkles, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenantCurrency } from '@/components/CurrencyDisplay';
import { useExchangeRates, convertPrice, formatPrice } from '@/hooks/use-exchange-rates';

interface SubscriptionTier {
  id: string;
  name: string;
  tierType: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  maxChildren: number;
}

interface PaymentSimulatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTierName?: string | null;
  tiers: SubscriptionTier[];
  onConfirmUpgrade: (tierId: string) => Promise<void>;
}

const FEATURE_LABELS: Record<string, string> = {
  savings_vaults: 'Cofres de Poupança',
  dream_vaults: 'Cofres de Sonhos',
  custom_rewards: 'Recompensas Personalizadas',
  budget_exceptions: 'Exceções de Orçamento',
  multi_child: 'Multi-Criança (até 10)',
  advanced_analytics: 'Relatórios Avançados',
  export_reports: 'Exportar Relatórios',
  real_money_wallet: 'Carteira Dinheiro Real',
  classroom_mode: 'Modo Sala de Aula',
  priority_support: 'Suporte Prioritário',
};

type Step = 'select' | 'payment' | 'processing' | 'success';

export default function PaymentSimulator({
  open,
  onOpenChange,
  currentTierName,
  tiers,
  onConfirmUpgrade,
}: PaymentSimulatorProps) {
  const [step, setStep] = useState<Step>('select');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const { data: tenantCurrency } = useTenantCurrency();
  const { data: rates = [] } = useExchangeRates();

  const currencySymbol = tenantCurrency?.symbol ?? 'Kz';
  const currencyCode = tenantCurrency?.code ?? 'AOA';
  const decimals = tenantCurrency?.decimalPlaces ?? 0;

  // Base prices are in EUR
  const convertedPrice = (eurAmount: number) => convertPrice(eurAmount, 'EUR', currencyCode, rates);
  const fmtPrice = (eurAmount: number) => formatPrice(convertedPrice(eurAmount), currencySymbol, decimals);

  const reset = () => {
    setStep('select');
    setSelectedTier(null);
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardName('');
  };

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const isFormValid = cardNumber.replace(/\s/g, '').length === 16 && cardExpiry.length === 5 && cardCvc.length >= 3 && cardName.length >= 2;

  const handlePay = async () => {
    if (!selectedTier) return;
    setStep('processing');
    await new Promise((r) => setTimeout(r, 2200));
    try {
      await onConfirmUpgrade(selectedTier.id);
      setStep('success');
    } catch {
      setStep('payment');
    }
  };

  const upgradeTiers = tiers.filter(
    (t) =>
      t.name !== currentTierName &&
      t.priceMonthly >= 0
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* ─── Step 1: Select Plan ─── */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  <Crown className="h-5 w-5 text-accent-foreground" />
                  Escolhe o teu plano
                </DialogTitle>
              </DialogHeader>

              <div className="flex items-center justify-center gap-2 mt-4 mb-5">
                <button
                  onClick={() => setBilling('monthly')}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
                    billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
                    billing === 'yearly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  Anual <span className="text-[10px] ml-1 opacity-70">-17%</span>
                </button>
              </div>

              <div className="space-y-3">
                {upgradeTiers.map((tier) => {
                  const price = billing === 'monthly' ? tier.priceMonthly : tier.priceYearly;
                  const period = billing === 'monthly' ? '/mês' : '/ano';
                  return (
                    <motion.div key={tier.id} whileTap={{ scale: 0.98 }}>
                      <Card
                        className={cn(
                          'cursor-pointer border-2 transition-all hover:shadow-md',
                          selectedTier?.id === tier.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border/50 hover:border-primary/30'
                        )}
                        onClick={() => setSelectedTier(tier)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-display font-bold text-sm">{tier.name}</h3>
                            <span className="font-display font-bold text-lg text-primary">
                              {fmtPrice(price)}
                              <span className="text-xs text-muted-foreground font-normal">{period}</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {tier.features.slice(0, 5).map((f) => (
                              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                {FEATURE_LABELS[f] ?? f}
                              </span>
                            ))}
                            {tier.features.length > 5 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                +{tier.features.length - 5} mais
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              <Button
                className="w-full mt-5 rounded-xl font-display gap-2"
                disabled={!selectedTier}
                onClick={() => setStep('payment')}
              >
                <CreditCard className="h-4 w-4" />
                Continuar para pagamento
              </Button>
            </motion.div>
          )}

          {/* ─── Step 2: Payment Form ─── */}
          {step === 'payment' && selectedTier && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Dados de Pagamento
                  <span className="text-[10px] bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full font-medium ml-auto">
                    SIMULADOR
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="bg-muted/50 rounded-xl p-3 mt-4 mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Plano selecionado</p>
                  <p className="font-display font-bold text-sm">{selectedTier.name}</p>
                </div>
                <p className="font-display font-bold text-primary">
                  {fmtPrice(billing === 'monthly' ? selectedTier.priceMonthly : selectedTier.priceYearly)}
                  <span className="text-[10px] text-muted-foreground font-normal">
                    /{billing === 'monthly' ? 'mês' : 'ano'}
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium">Nome no cartão</Label>
                  <Input placeholder="João Silva" value={cardName} onChange={(e) => setCardName(e.target.value)} className="rounded-xl mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Número do cartão</Label>
                  <Input placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} className="rounded-xl mt-1 font-mono" maxLength={19} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Validade</Label>
                    <Input placeholder="12/26" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} className="rounded-xl mt-1 font-mono" maxLength={5} />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">CVC</Label>
                    <Input placeholder="123" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} className="rounded-xl mt-1 font-mono" maxLength={4} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>Simulador seguro — nenhum pagamento real será processado</span>
              </div>

              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="rounded-xl font-display" onClick={() => setStep('select')}>
                  Voltar
                </Button>
                <Button className="flex-1 rounded-xl font-display gap-2" disabled={!isFormValid} onClick={handlePay}>
                  <Crown className="h-4 w-4" />
                  Pagar {fmtPrice(billing === 'monthly' ? selectedTier.priceMonthly : selectedTier.priceYearly)}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: Processing ─── */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-12 flex flex-col items-center justify-center text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Loader2 className="h-10 w-10 text-primary" />
              </motion.div>
              <p className="font-display font-bold text-sm mt-4">A processar pagamento...</p>
              <p className="text-xs text-muted-foreground mt-1">Por favor aguarda um momento</p>
            </motion.div>
          )}

          {/* ─── Step 4: Success ─── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-10 flex flex-col items-center justify-center text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }} className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-secondary" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 className="font-display font-bold text-lg">Upgrade concluído! 🎉</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  O teu plano foi atualizado para <span className="font-bold text-foreground">{selectedTier?.name}</span>.
                </p>
                <p className="text-xs text-muted-foreground mt-1">As novas funcionalidades já estão disponíveis.</p>
              </motion.div>
              <Button className="mt-6 rounded-xl font-display gap-2" onClick={() => { handleClose(false); window.location.reload(); }}>
                <Sparkles className="h-4 w-4" />
                Começar a explorar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

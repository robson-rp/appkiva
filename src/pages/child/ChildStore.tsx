import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kivo } from '@/components/Kivo';
import { mockStoreItems, mockChildren, mockParentRewards } from '@/data/mock-data';
import { ShoppingBag, Sparkles, Tag, Gift, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ChildStore() {
  const child = mockChildren[0];

  const handlePurchase = (name: string, price: number) => {
    if (child.balance < price) {
      toast({ title: 'Saldo insuficiente', description: 'Não tens moedas suficientes para comprar este item.', variant: 'destructive' });
    } else {
      toast({ title: 'Compra realizada! 🎉', description: `Compraste "${name}" por ${price} moedas.` });
    }
  };

  const categoryLabels: Record<string, string> = { avatar: 'Avatar', accessory: 'Acessório', badge: 'Badge', digital: 'Digital', experience: 'Experiência', privilege: 'Privilégio', physical: 'Físico' };
  const categoryColors: Record<string, string> = {
    avatar: 'bg-primary/10 text-primary border-primary/20',
    accessory: 'bg-accent/10 text-accent-foreground border-accent/20',
    badge: 'bg-secondary text-secondary-foreground border-secondary',
    digital: 'bg-muted text-muted-foreground border-muted',
    experience: 'bg-primary/10 text-primary border-primary/20',
    privilege: 'bg-accent/10 text-accent-foreground border-accent/20',
    physical: 'bg-secondary/10 text-secondary border-secondary/20',
  };

  const parentRewards = mockParentRewards.filter(r => r.available && (!r.childId || r.childId === child.id));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold">Loja Virtual</h1>
                  <p className="text-sm opacity-80">Gasta as tuas moedas com sabedoria!</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                <span className="text-lg">🪙</span>
                <span className="font-display font-bold text-lg">{child.balance}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="store" className="w-full">
        <TabsList className="w-full grid grid-cols-2 rounded-xl h-11">
          <TabsTrigger value="store" className="rounded-lg font-display text-xs gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5" /> Itens Virtuais
          </TabsTrigger>
          <TabsTrigger value="rewards" className="rounded-lg font-display text-xs gap-1.5">
            <Gift className="h-3.5 w-3.5" /> Recompensas
          </TabsTrigger>
        </TabsList>

        {/* Virtual Items */}
        <TabsContent value="store" className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            {mockStoreItems.map((item, i) => {
              const canBuy = child.balance >= item.price;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring' as const, stiffness: 300, damping: 30 }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:-translate-y-1">
                    <CardContent className="p-0">
                      <div className="relative bg-muted/30 p-6 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20" />
                        <motion.span
                          className="text-5xl block relative z-10"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: 'spring' as const, stiffness: 400 }}
                        >
                          {item.image}
                        </motion.span>
                        {i === 0 && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[10px] font-display font-semibold">
                            <Sparkles className="h-3 w-3" /> Novo
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-2">
                        <Badge variant="outline" className={`text-[10px] ${categoryColors[item.category]}`}>
                          <Tag className="h-2.5 w-2.5 mr-1" />
                          {categoryLabels[item.category]}
                        </Badge>
                        <h3 className="font-display font-semibold text-sm">{item.name}</h3>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="flex justify-between items-center pt-1">
                          <span className="font-display font-bold text-sm">🪙 {item.price}</span>
                          <Button
                            size="sm"
                            className="rounded-xl text-xs font-display h-7 px-3 transition-all"
                            onClick={() => handlePurchase(item.name, item.price)}
                            disabled={!canBuy}
                            variant={canBuy ? 'default' : 'secondary'}
                          >
                            {canBuy ? 'Comprar' : 'Sem saldo'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Parent Rewards */}
        <TabsContent value="rewards" className="mt-4">
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-accent-foreground" />
              <span className="font-display font-bold">Recompensas dos Pais</span>
            </div>
            <p className="text-xs text-muted-foreground">Recompensas especiais criadas pela tua família!</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parentRewards.map((reward, i) => {
              const canBuy = child.balance >= reward.price;
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring' as const, stiffness: 300, damping: 30 }}
                >
                  <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="h-0.5 bg-gradient-to-r from-accent to-primary" />
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl shrink-0">
                          {reward.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-display font-bold text-sm">{reward.name}</h3>
                            <Badge variant="outline" className={`text-[9px] ${categoryColors[reward.category]}`}>
                              {categoryLabels[reward.category]}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{reward.description}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-border/30">
                        <span className="font-display font-bold text-sm">🪙 {reward.price}</span>
                        <Button
                          size="sm"
                          className="rounded-xl text-xs font-display h-8 px-4 gap-1 transition-all"
                          onClick={() => handlePurchase(reward.name, reward.price)}
                          disabled={!canBuy}
                          variant={canBuy ? 'default' : 'secondary'}
                        >
                          <Gift className="h-3 w-3" />
                          {canBuy ? 'Resgatar' : 'Sem saldo'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Kivo page="store" />
    </div>
  );
}
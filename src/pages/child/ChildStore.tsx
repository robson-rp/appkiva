import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kivo } from '@/components/Kivo';
import { mockStoreItems, mockChildren } from '@/data/mock-data';
import { ShoppingBag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ChildStore() {
  const child = mockChildren[0];

  const handlePurchase = (item: typeof mockStoreItems[0]) => {
    if (child.balance < item.price) {
      toast({ title: 'Saldo insuficiente', description: 'Não tens moedas suficientes para comprar este item.', variant: 'destructive' });
    } else {
      toast({ title: 'Compra realizada! 🎉', description: `Compraste "${item.name}" por ${item.price} moedas.` });
    }
  };

  const categoryLabels = { avatar: 'Avatar', accessory: 'Acessório', badge: 'Badge', digital: 'Digital' };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-xl font-bold">Loja Virtual</h1>
          <p className="text-sm text-muted-foreground">Gasta as tuas moedas com sabedoria!</p>
        </div>
        <div className="flex items-center gap-1 bg-kivara-light-gold rounded-xl px-3 py-1.5">
          <span>🪙</span>
          <span className="font-display font-bold text-sm">{child.balance}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {mockStoreItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-muted/50 p-6 text-center">
                  <span className="text-5xl">{item.image}</span>
                </div>
                <div className="p-3 space-y-2">
                  <Badge variant="outline" className="text-[10px]">{categoryLabels[item.category]}</Badge>
                  <h3 className="font-display font-semibold text-sm">{item.name}</h3>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-display font-bold text-sm">🪙 {item.price}</span>
                    <Button
                      size="sm"
                      className="rounded-xl text-xs font-display h-7 px-3"
                      onClick={() => handlePurchase(item)}
                      disabled={child.balance < item.price}
                    >
                      Comprar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Kivo page="store" />
    </div>
  );
}

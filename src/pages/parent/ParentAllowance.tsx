import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockChildren } from '@/data/mock-data';
import { CoinDisplay } from '@/components/CoinDisplay';
import { motion } from 'framer-motion';
import { Wallet, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ParentAllowance() {
  const handleSend = (childName: string) => {
    toast({ title: 'Mesada enviada! 💰', description: `A mesada foi enviada para ${childName}.` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Mesada Virtual</h1>
        <p className="text-sm text-muted-foreground">Define e envia a mesada semanal</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {mockChildren.map((child, i) => (
          <motion.div key={child.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{child.avatar}</span>
                  <div>
                    <h3 className="font-display font-bold">{child.name}</h3>
                    <p className="text-xs text-muted-foreground">Saldo actual</p>
                    <CoinDisplay amount={child.balance} size="sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Mesada semanal (moedas)</Label>
                  <Input type="number" defaultValue={child.weeklyAllowance} className="rounded-xl" />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 rounded-xl font-display gap-1" onClick={() => handleSend(child.name)}>
                    <Send className="h-4 w-4" /> Enviar Mesada
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

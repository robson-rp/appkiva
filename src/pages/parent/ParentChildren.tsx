import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockChildren } from '@/data/mock-data';
import { CoinDisplay } from '@/components/CoinDisplay';
import { LevelBadge } from '@/components/LevelBadge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ParentChildren() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestão de Crianças</h1>
          <p className="text-sm text-muted-foreground">Gere os perfis das tuas crianças</p>
        </div>
        <Button className="rounded-xl font-display gap-1">
          <Plus className="h-4 w-4" /> Adicionar Criança
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {mockChildren.map((child, i) => (
          <motion.div key={child.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-kivara-light-blue flex items-center justify-center text-4xl">
                    {child.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg">{child.name}</h3>
                    <p className="text-sm text-muted-foreground">@{child.username} · PIN: {child.pin}</p>
                    <LevelBadge level={child.level} points={child.kivaPoints} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Saldo</p>
                    <CoinDisplay amount={child.balance} size="sm" />
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Mesada Semanal</p>
                    <CoinDisplay amount={child.weeklyAllowance} size="sm" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl font-display gap-1">
                    <Edit className="h-3 w-3" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
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

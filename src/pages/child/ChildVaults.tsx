import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Kivo } from '@/components/Kivo';
import { mockVaults, mockChildren } from '@/data/mock-data';
import { Plus, PiggyBank } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ChildVaults() {
  const child = mockChildren[0];
  const vaults = mockVaults.filter((v) => v.childId === child.id);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-xl font-bold">Cofres de Poupança</h1>
          <p className="text-sm text-muted-foreground">Poupa para os teus objectivos!</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl font-display gap-1">
              <Plus className="h-4 w-4" /> Novo Cofre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Criar Novo Cofre</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do objectivo</Label>
                <Input placeholder="Ex: Bicicleta nova" />
              </div>
              <div className="space-y-2">
                <Label>Meta (moedas)</Label>
                <Input type="number" placeholder="500" />
              </div>
              <Button className="w-full rounded-xl font-display">Criar Cofre</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {vaults.map((vault, i) => {
          const pct = Math.round((vault.currentAmount / vault.targetAmount) * 100);
          return (
            <motion.div
              key={vault.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-kivara-light-gold flex items-center justify-center text-2xl">
                        {vault.icon}
                      </div>
                      <div>
                        <h3 className="font-display font-semibold">{vault.name}</h3>
                        <p className="text-xs text-muted-foreground">Criado em {vault.createdAt}</p>
                      </div>
                    </div>
                    <span className="font-display font-bold text-sm">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-3 mb-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">🪙 {vault.currentAmount} / {vault.targetAmount}</span>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-display h-7">
                      + Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Kivo page="vaults" />
    </div>
  );
}

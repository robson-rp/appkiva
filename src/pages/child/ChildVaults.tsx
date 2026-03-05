import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Kivo } from '@/components/Kivo';
import { mockVaults, mockChildren } from '@/data/mock-data';
import { Plus, PiggyBank, Target, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ChildVaults() {
  const child = mockChildren[0];
  const vaults = mockVaults.filter((v) => v.childId === child.id);
  const totalSaved = vaults.reduce((s, v) => s + v.currentAmount, 0);
  const totalTarget = vaults.reduce((s, v) => s + v.targetAmount, 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <PiggyBank className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm opacity-80">Total Poupado</p>
                <h2 className="text-3xl font-display font-bold">🪙 {totalSaved}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <Target className="h-4 w-4" />
              <span>Meta total: {totalTarget} moedas</span>
            </div>
            <Progress value={Math.round((totalSaved / totalTarget) * 100)} className="h-2 mt-3 bg-white/20" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-xl font-bold">Cofres de Poupança</h1>
          <p className="text-sm text-muted-foreground">{vaults.length} cofres activos</p>
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

      {/* Vault Cards */}
      <div className="space-y-4">
        {vaults.map((vault, i) => {
          const pct = Math.round((vault.currentAmount / vault.targetAmount) * 100);
          return (
            <motion.div
              key={vault.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm hover:-translate-y-0.5">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center text-3xl"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        {vault.icon}
                      </motion.div>
                      <div>
                        <h3 className="font-display font-semibold text-base">{vault.name}</h3>
                        <p className="text-xs text-muted-foreground">Criado em {vault.createdAt}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-lg text-primary">{pct}%</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>progresso</span>
                      </div>
                    </div>
                  </div>
                  <Progress value={pct} className="h-3 mb-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-medium">🪙 {vault.currentAmount} / {vault.targetAmount}</span>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-display h-8 gap-1 hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Plus className="h-3 w-3" /> Adicionar
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

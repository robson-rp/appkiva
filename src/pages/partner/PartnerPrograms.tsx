import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, School, Search } from 'lucide-react';
import { useState } from 'react';

const programs = [
  { id: '1', name: 'Escola Primária Sol', type: 'school' as const, children: 85, status: 'active' as const, since: 'Jan 2026' },
  { id: '2', name: 'Família Ferreira', type: 'family' as const, children: 3, status: 'active' as const, since: 'Fev 2026' },
  { id: '3', name: 'Colégio Esperança', type: 'school' as const, children: 120, status: 'active' as const, since: 'Nov 2025' },
  { id: '4', name: 'Família Santos', type: 'family' as const, children: 2, status: 'active' as const, since: 'Mar 2026' },
  { id: '5', name: 'Escola Básica Norte', type: 'school' as const, children: 65, status: 'pending' as const, since: 'Mar 2026' },
  { id: '6', name: 'Família Costa', type: 'family' as const, children: 4, status: 'active' as const, since: 'Dez 2025' },
];

export default function PartnerPrograms() {
  const [search, setSearch] = useState('');

  const filtered = programs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Programas 📋</h1>
        <p className="text-muted-foreground font-body">Famílias e escolas associadas ao programa de parceria</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar programa..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(prog => (
          <Card key={prog.id} className="rounded-2xl border-border/50 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  {prog.type === 'school' ? (
                    <School className="h-5 w-5 text-chart-3" />
                  ) : (
                    <Users className="h-5 w-5 text-primary" />
                  )}
                </div>
                <Badge variant={prog.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                  {prog.status === 'active' ? 'Activo' : 'Pendente'}
                </Badge>
              </div>
              <h3 className="font-display font-bold text-foreground">{prog.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {prog.children} crianças • Desde {prog.since}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-2xl font-bold text-foreground">
                {programs.filter(p => p.type === 'school').length}
              </p>
              <p className="text-xs text-muted-foreground">Escolas</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-foreground">
                {programs.filter(p => p.type === 'family').length}
              </p>
              <p className="text-xs text-muted-foreground">Famílias</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-foreground">
                {programs.reduce((sum, p) => sum + p.children, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Crianças</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

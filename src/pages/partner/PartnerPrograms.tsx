import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, School, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { usePartnerPrograms } from '@/hooks/use-partner-data';
import { useAuth } from '@/contexts/AuthContext';
import { ProgramInviteDialog } from '@/components/partner/ProgramInviteDialog';
import { CreateProgramDialog } from '@/components/partner/CreateProgramDialog';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function PartnerPrograms() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const { data: programs, isLoading } = usePartnerPrograms();

  const filtered = (programs ?? []).filter(p =>
    p.program_name.toLowerCase().includes(search.toLowerCase())
  );

  const schools = filtered.filter(p => p.program_type === 'school');
  const families = filtered.filter(p => p.program_type === 'family');
  const totalChildren = filtered.reduce((sum, p) => sum + p.children_count, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                  {prog.program_type === 'school' ? (
                    <School className="h-5 w-5 text-chart-3" />
                  ) : (
                    <Users className="h-5 w-5 text-primary" />
                  )}
                </div>
                <Badge variant={prog.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                  {prog.status === 'active' ? 'Activo' : prog.status === 'pending' ? 'Pendente' : 'Inactivo'}
                </Badge>
              </div>
              <h3 className="font-display font-bold text-foreground">{prog.program_name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {prog.children_count} crianças • Desde {format(new Date(prog.started_at), 'MMM yyyy', { locale: pt })}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Investimento: €{Number(prog.investment_amount).toLocaleString()}
              </p>
              <div className="mt-3 pt-3 border-t border-border/50">
                <ProgramInviteDialog
                  programId={prog.id}
                  programName={prog.program_name}
                  partnerTenantId={prog.partner_tenant_id}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-3 text-center py-8">Nenhum programa encontrado</p>
        )}
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-2xl font-bold text-foreground">{schools.length}</p>
              <p className="text-xs text-muted-foreground">Escolas</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-foreground">{families.length}</p>
              <p className="text-xs text-muted-foreground">Famílias</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-foreground">{totalChildren}</p>
              <p className="text-xs text-muted-foreground">Total Crianças</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

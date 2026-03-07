import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, ChevronDown, ChevronRight, Home, School, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const roleLabels: Record<string, string> = {
  parent: 'Encarregado',
  child: 'Criança',
  teen: 'Adolescente',
  teacher: 'Professor',
  admin: 'Admin',
  partner: 'Parceiro',
};

function useAllUsers() {
  return useQuery({
    queryKey: ['admin_all_users'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar, household_id, tenant_id, school_tenant_id, institution_name, sector, user_id, created_at');
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, name, tenant_type');
      const { data: households } = await supabase
        .from('households')
        .select('id, name');
      const { data: children } = await supabase
        .from('children')
        .select('profile_id, parent_profile_id, nickname');

      const roleMap = new Map<string, string>();
      (roles ?? []).forEach(r => roleMap.set(r.user_id, r.role));
      const tenantMap = new Map((tenants ?? []).map(t => [t.id, t]));
      const householdMap = new Map((households ?? []).map(h => [h.id, h]));

      return (profiles ?? []).map(p => ({
        ...p,
        role: roleMap.get(p.user_id) ?? 'unknown',
        tenant: p.tenant_id ? tenantMap.get(p.tenant_id) : null,
        school: p.school_tenant_id ? tenantMap.get(p.school_tenant_id) : null,
        household: p.household_id ? householdMap.get(p.household_id) : null,
        childrenOf: (children ?? []).filter(c => c.parent_profile_id === p.id),
        parentOf: (children ?? []).find(c => c.profile_id === p.id),
      }));
    },
  });
}

export default function AdminUsers() {
  const { data: users = [], isLoading } = useAllUsers();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (search && !u.display_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach(u => { counts[u.role] = (counts[u.role] ?? 0) + 1; });
    return counts;
  }, [users]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Utilizadores e Vínculos</h1>
        <p className="text-sm text-muted-foreground">Contas registadas, famílias, escolas e parcerias</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {Object.entries(roleLabels).map(([key, label]) => (
          <Card key={key} className="border-border/50">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-display font-bold">{stats[key] ?? 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex-1 min-w-[180px]">
            <Label className="text-xs text-muted-foreground mb-1 block">Pesquisar</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Nome..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="min-w-[160px]">
            <Label className="text-xs text-muted-foreground mb-1 block">Papel</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(roleLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">A carregar...</p>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Utilizador</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Família</TableHead>
                    <TableHead>Escola</TableHead>
                    <TableHead>Tenant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum utilizador encontrado</TableCell></TableRow>
                  ) : filtered.map(u => (
                    <>
                      <TableRow key={u.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setExpanded(expanded === u.id ? null : u.id)}>
                        <TableCell>
                          {u.childrenOf.length > 0 ? (
                            expanded === u.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{u.avatar ?? '👤'}</span>
                            <div>
                              <p className="text-sm font-medium">{u.display_name}</p>
                              {u.institution_name && <p className="text-[10px] text-muted-foreground">{u.institution_name}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{roleLabels[u.role] ?? u.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {u.household ? (
                            <div className="flex items-center gap-1 text-xs">
                              <Home className="h-3 w-3 text-muted-foreground" />
                              <span>{u.household.name}</span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {u.school ? (
                            <div className="flex items-center gap-1 text-xs">
                              <School className="h-3 w-3 text-muted-foreground" />
                              <span>{u.school.name}</span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {u.tenant ? (
                            <div className="flex items-center gap-1 text-xs">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              <span>{u.tenant.name}</span>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                      </TableRow>
                      {/* Expanded children */}
                      <AnimatePresence>
                        {expanded === u.id && u.childrenOf.length > 0 && (
                          <TableRow key={`${u.id}-children`}>
                            <TableCell colSpan={6} className="bg-muted/20 p-0">
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-3 space-y-1">
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Filhos/Dependentes</p>
                                  {u.childrenOf.map(child => {
                                    const childProfile = users.find(up => up.id === child.profile_id);
                                    return (
                                      <div key={child.profile_id} className="flex items-center gap-2 p-2 rounded-lg bg-background/60">
                                        <span className="text-base">{childProfile?.avatar ?? '👤'}</span>
                                        <span className="text-sm font-medium">{childProfile?.display_name ?? child.nickname ?? 'Criança'}</span>
                                        <Badge variant="outline" className="text-[9px]">{roleLabels[childProfile?.role ?? 'child']}</Badge>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            </TableCell>
                          </TableRow>
                        )}
                      </AnimatePresence>
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

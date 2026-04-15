import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, Lock, Unlock, Search, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { QueryError } from '@/components/ui/query-error';
import { useT } from '@/contexts/LanguageContext';

export default function AdminAuthSecurity() {
  const t = useT();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('all');

  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: ['auth-events', eventFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '200', order: 'created_at:desc' });
      if (eventFilter !== 'all') params.set('event_type', eventFilter);
      const res = await api.get<any>('/admin/auth-events?' + params.toString());
      return Array.isArray(res) ? res : (res?.data ?? []);
    },
  });

  const { data: lockouts } = useQuery({
    queryKey: ['login-lockouts'],
    queryFn: async () => {
      const res = await api.get<any>('/admin/login-lockouts?failed_attempts_gt=0&limit=50&order=last_attempt_at:desc');
      return Array.isArray(res) ? res : (res?.data ?? []);
    },
  });

  const handleUnlock = async (email: string) => {
    try {
      await api.post('/auth/security-check', { action: 'unlock-account', email });
      toast({ title: t('security.account_unlocked') });
      qc.invalidateQueries({ queryKey: ['login-lockouts'] });
      qc.invalidateQueries({ queryKey: ['auth-events'] });
    } catch (e: any) {
      toast({ title: t('auth.error_unexpected'), description: e.message, variant: 'destructive' });
    }
  };

  const filteredEvents = events?.filter(e =>
    !filter || (e.email && e.email.toLowerCase().includes(filter.toLowerCase()))
  ) ?? [];

  const riskColors: Record<string, string> = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-accent text-accent-foreground',
    high: 'bg-destructive/80 text-destructive-foreground',
    critical: 'bg-destructive text-destructive-foreground',
  };

  const eventTypes = ['all', 'login_success', 'login_failure', 'lockout', 'otp_sent', 'otp_verified', 'password_reset_requested', 'account_unlocked'];

  const failureCount = events?.filter(e => e.event_type === 'login_failure').length ?? 0;
  const lockoutCount = events?.filter(e => e.event_type === 'lockout').length ?? 0;
  const activeLockouts = lockouts?.filter((l: any) => l.locked_until && new Date(l.locked_until) > new Date()).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-foreground">{t('security.auth_title')}</h2>
        <p className="text-sm text-muted-foreground">{t('security.auth_subtitle')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('security.failed_logins')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">{failureCount}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('security.lockouts')}</CardTitle>
              <Lock className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">{lockoutCount}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('security.active_lockouts')}</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">{activeLockouts}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Locked Accounts */}
      {lockouts && lockouts.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-display">{t('security.locked_accounts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>{t('security.attempts')}</TableHead>
                  <TableHead>{t('security.locked_until')}</TableHead>
                  <TableHead>{t('admin.risk.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lockouts.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">{l.email}</TableCell>
                    <TableCell>{l.failed_attempts}</TableCell>
                    <TableCell className="text-xs">
                      {l.locked_until && new Date(l.locked_until) > new Date() ? (
                        <Badge className="bg-destructive/80 text-destructive-foreground">
                          {format(new Date(l.locked_until), 'HH:mm')}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleUnlock(l.email)}>
                        <Unlock className="h-3 w-3 mr-1" />
                        {t('security.unlock')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Event Log */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-display">{t('security.event_log')}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Email..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="pl-8 h-8 w-40 text-xs rounded-lg"
                />
              </div>
              <select
                value={eventFilter}
                onChange={e => setEventFilter(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background text-xs px-2"
              >
                {eventTypes.map(et => (
                  <option key={et} value={et}>{et === 'all' ? t('common.all') : et.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <Button size="sm" variant="ghost" onClick={() => qc.invalidateQueries({ queryKey: ['auth-events'] })}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{t('admin.risk.loading')}</p>
          ) : error ? (
            <QueryError error={error} onRetry={() => refetch()} />
          ) : !filteredEvents.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{t('security.no_events')}</p>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.risk.date')}</TableHead>
                    <TableHead>{t('admin.risk.type')}</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>{t('security.risk')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event: any) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(event.created_at), 'dd/MM HH:mm:ss')}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{event.event_type}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{event.email || '—'}</TableCell>
                      <TableCell>
                        <Badge className={riskColors[event.risk_level] ?? ''}>
                          {event.risk_level}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

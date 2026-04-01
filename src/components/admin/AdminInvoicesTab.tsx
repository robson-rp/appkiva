import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { CheckCircle2, Clock, XCircle, Download, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAdminInvoices } from '@/hooks/use-subscription';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useT } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { generateInvoicePdf } from '@/lib/invoice-pdf';

export default function AdminInvoicesTab() {
  const t = useT();
  const qc = useQueryClient();
  const { data: invoices = [], isLoading } = useAdminInvoices();
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return invoices;
    return invoices.filter((inv: any) => inv.status === statusFilter);
  }, [invoices, statusFilter]);

  const stats = useMemo(() => {
    const paid = invoices.filter((i: any) => i.status === 'paid');
    const pending = invoices.filter((i: any) => i.status === 'pending');
    const failed = invoices.filter((i: any) => i.status === 'failed');
    return {
      totalRevenue: paid.reduce((s: number, i: any) => s + Number(i.amount), 0),
      pendingAmount: pending.reduce((s: number, i: any) => s + Number(i.amount), 0),
      failedCount: failed.length,
      totalCount: invoices.length,
    };
  }, [invoices]);

  const markAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('subscription_invoices')
        .update({ status: 'paid', paid_at: new Date().toISOString(), payment_method: 'manual' })
        .eq('id', invoiceId);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success(t('admin.invoices.marked_paid'));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { label: t('admin.invoices.total_revenue'), value: `${stats.totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'text-secondary' },
          { label: t('admin.invoices.pending'), value: `${stats.pendingAmount.toFixed(0)}`, icon: Clock, color: 'text-amber-500' },
          { label: t('admin.invoices.failed'), value: String(stats.failedCount), icon: AlertTriangle, color: 'text-destructive' },
          { label: t('admin.invoices.total'), value: String(stats.totalCount), icon: DollarSign, color: 'text-primary' },
        ].map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-xl font-display font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.invoices.all')}</SelectItem>
            <SelectItem value="paid">{t('admin.invoices.status_paid')}</SelectItem>
            <SelectItem value="pending">{t('admin.invoices.status_pending')}</SelectItem>
            <SelectItem value="failed">{t('admin.invoices.status_failed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">{t('admin.subs.loading')}</p>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.invoices.col_tenant')}</TableHead>
                  <TableHead>{t('admin.invoices.col_plan')}</TableHead>
                  <TableHead className="text-right">{t('admin.invoices.col_amount')}</TableHead>
                  <TableHead>{t('admin.invoices.col_period')}</TableHead>
                  <TableHead>{t('admin.invoices.col_date')}</TableHead>
                  <TableHead>{t('admin.invoices.col_status')}</TableHead>
                  <TableHead className="text-right">{t('admin.invoices.col_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {t('admin.invoices.no_invoices')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-sm">{inv.tenant_name ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{inv.tier_name ?? '—'}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {inv.currency} {Number(inv.amount).toFixed(0)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {inv.billing_period === 'monthly' ? t('parent.subscription.monthly')
                          : inv.billing_period === 'yearly' ? t('parent.subscription.yearly')
                          : inv.billing_period === 'one_time' ? t('parent.subscription.one_time')
                          : inv.billing_period ?? '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            inv.status === 'paid' && 'border-green-300 text-green-700',
                            inv.status === 'pending' && 'border-amber-300 text-amber-700',
                            inv.status === 'failed' && 'border-destructive text-destructive',
                          )}
                        >
                          {inv.status === 'paid' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : inv.status === 'pending' ? <Clock className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                          {t(`admin.invoices.status_${inv.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => generateInvoicePdf(
                            { ...inv, tier_name: inv.tier_name },
                            inv.tenant_name ?? 'Cliente',
                            inv.currency ?? 'USD',
                            0,
                          )}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        {inv.status === 'pending' && (
                          <Button
                            variant="outline" size="sm" className="text-xs h-7"
                            onClick={() => markAsPaid(inv.id)}
                          >
                            {t('admin.invoices.mark_paid')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

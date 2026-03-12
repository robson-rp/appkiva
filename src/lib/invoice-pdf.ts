import jsPDF from 'jspdf';
import type { SubscriptionInvoice } from '@/hooks/use-subscription';

export function generateInvoicePdf(
  invoice: SubscriptionInvoice,
  tenantName: string,
  currencySymbol: string,
  decimalPlaces: number = 0,
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(30, 58, 138); // primary-ish
  doc.rect(0, 0, w, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('KIVARA', 20, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Factura / Invoice', 20, 30);

  // Invoice number & date
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  const shortId = invoice.id.slice(0, 8).toUpperCase();
  doc.text(`#INV-${shortId}`, w - 20, 20, { align: 'right' });
  doc.text(new Date(invoice.created_at).toLocaleDateString('pt-AO'), w - 20, 28, { align: 'right' });

  // Tenant info
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(tenantName || 'Cliente', 20, 55);

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 62, w - 20, 62);

  // Details table header
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 68, w - 40, 10, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('Descrição', 25, 75);
  doc.text('Período', 100, 75);
  doc.text('Valor', w - 25, 75, { align: 'right' });

  // Details row
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  const tierName = invoice.tier_name || 'Subscrição';
  const periodLabel = invoice.billing_period === 'monthly'
    ? 'Mensal'
    : invoice.billing_period === 'yearly'
    ? 'Anual'
    : invoice.billing_period === 'one_time'
    ? 'Pagamento único'
    : invoice.billing_period || '—';

  const formattedAmount = `${currencySymbol} ${invoice.amount.toFixed(decimalPlaces)}`;

  doc.text(tierName, 25, 87);
  doc.text(periodLabel, 100, 87);
  doc.text(formattedAmount, w - 25, 87, { align: 'right' });

  // Separator
  doc.line(20, 93, w - 20, 93);

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total', 25, 103);
  doc.text(formattedAmount, w - 25, 103, { align: 'right' });

  // Status badge
  const statusLabel = invoice.status === 'paid' ? 'PAGO' : invoice.status === 'pending' ? 'PENDENTE' : 'FALHOU';
  const statusColor = invoice.status === 'paid' ? [34, 197, 94] : invoice.status === 'pending' ? [245, 158, 11] : [239, 68, 68];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(20, 112, 30, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(statusLabel, 35, 117.5, { align: 'center' });

  // Payment info
  if (invoice.paid_at) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pago em: ${new Date(invoice.paid_at).toLocaleDateString('pt-AO')}`, 55, 117.5);
  }
  if (invoice.payment_method) {
    doc.text(`Método: ${invoice.payment_method}`, 55, 123);
  }

  // Footer
  doc.setTextColor(160, 160, 160);
  doc.setFontSize(7);
  doc.text('KIVARA — Educação financeira para crianças', w / 2, 280, { align: 'center' });
  doc.text('Este documento foi gerado automaticamente.', w / 2, 285, { align: 'center' });

  doc.save(`Factura-KIVARA-${shortId}.pdf`);
}

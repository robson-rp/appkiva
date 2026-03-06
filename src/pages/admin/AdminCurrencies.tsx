import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

export default function AdminCurrencies() {
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'AOA', name: 'Kwanza Angolano', symbol: 'Kz', flag: '🇦🇴' },
    { code: 'NGN', name: 'Naira Nigeriana', symbol: '₦', flag: '🇳🇬' },
    { code: 'KES', name: 'Xelim Queniano', symbol: 'KSh', flag: '🇰🇪' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Moedas Suportadas</h1>
        <p className="text-sm text-muted-foreground">Configuração de moedas da plataforma</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currencies.map((c) => (
          <Card key={c.code} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{c.flag} {c.code}</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-display font-bold">{c.symbol}</p>
              <p className="text-xs text-muted-foreground">{c.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

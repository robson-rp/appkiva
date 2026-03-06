import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function AdminCompliance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Compliance</h1>
        <p className="text-sm text-muted-foreground">Gestão de consentimento e conformidade</p>
      </div>
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <Shield className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">O painel de compliance será activado na Fase 3.</p>
        </CardContent>
      </Card>
    </div>
  );
}

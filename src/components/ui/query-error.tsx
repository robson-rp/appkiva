import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QueryErrorProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function QueryError({ error, onRetry, className = '' }: QueryErrorProps) {
  const message =
    (error as any)?.message ??
    (typeof error === 'string' ? error : 'Ocorreu um erro ao carregar os dados.');

  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${className}`}>
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <div>
        <p className="text-sm font-medium text-foreground">Erro ao carregar dados</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

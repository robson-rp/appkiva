import { Eye } from 'lucide-react';
import { useHighContrast } from '@/hooks/use-high-contrast';
import { useT } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

export function AccessibilityMenu() {
  const t = useT();
  const { highContrast, toggleHighContrast } = useHighContrast();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2.5 rounded-2xl hover:bg-muted/80 transition-all duration-200 active:scale-95"
          aria-label={t('accessibility.menu')}
        >
          <Eye className="h-[18px] w-[18px] text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem
          className="flex items-center justify-between gap-3 cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            toggleHighContrast();
          }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-small font-medium">{t('accessibility.highContrast')}</span>
            <span className="text-caption text-muted-foreground">{t('accessibility.highContrastDesc')}</span>
          </div>
          <Switch
            checked={highContrast}
            onCheckedChange={toggleHighContrast}
            aria-label={t('accessibility.highContrast')}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

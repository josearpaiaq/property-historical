import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore, Theme } from '@/stores/theme-store';

const themeConfig: Record<Theme, { icon: typeof Sun; label: string; next: Theme }> = {
  system: { icon: Monitor, label: 'System theme', next: 'light' },
  light: { icon: Sun, label: 'Light theme', next: 'dark' },
  dark: { icon: Moon, label: 'Dark theme', next: 'system' },
};

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const config = themeConfig[theme];
  const Icon = config.icon;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(config.next)}
      title={config.label}
      aria-label={config.label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

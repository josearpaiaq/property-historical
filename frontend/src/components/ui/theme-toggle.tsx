import { Sun, Moon, Monitor } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { useThemeStore, Theme } from '@/stores/theme-store';

const themeIcons: Record<Theme, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const Icon = themeIcons[theme];

  return (
    <Select value={theme} onValueChange={(val) => setTheme(val as Theme)}>
      <SelectTrigger className="h-8 w-8 px-0 justify-center border-0 bg-transparent [&>svg:last-child]:hidden">
        <Icon className="h-4 w-4" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="system">
          <span className="flex items-center gap-2"><Monitor className="h-3.5 w-3.5" /> System</span>
        </SelectItem>
        <SelectItem value="light">
          <span className="flex items-center gap-2"><Sun className="h-3.5 w-3.5" /> Light</span>
        </SelectItem>
        <SelectItem value="dark">
          <span className="flex items-center gap-2"><Moon className="h-3.5 w-3.5" /> Dark</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

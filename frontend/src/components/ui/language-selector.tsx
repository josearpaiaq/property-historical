import { useTranslation } from 'react-i18next';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Languages } from 'lucide-react';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en';

  const languages = [
    { code: 'es', label: 'ES' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <Select value={currentLang} onValueChange={(val) => i18n.changeLanguage(val)}>
      <SelectTrigger className="h-8 w-[70px] text-xs px-2">
        <div className='flex gap-1'>
          <Languages className="h-3 w-3" /> <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

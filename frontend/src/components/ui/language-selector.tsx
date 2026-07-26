import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language?.startsWith('es') ? 'es' : 'en'}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="h-8 px-2 text-xs rounded-md border border-input bg-background cursor-pointer"
      aria-label="Select language"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}

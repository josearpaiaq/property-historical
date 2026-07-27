import i18n from '@/i18n';

/**
 * Get the current locale from i18next
 */
function getLocale(): string {
  const lang = i18n.language || 'es';
  const localeMap: Record<string, string> = {
    es: 'es-ES',
    en: 'en-US',
  };
  return localeMap[lang] || lang;
}

/**
 * Normalize a date string: if it's date-only (YYYY-MM-DD), append T12:00:00
 * to prevent timezone boundary shifts.
 */
function normalizeDate(dateStr: string): Date {
  // If it's a date-only string (no T, no time info), add noon to avoid timezone issues
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T12:00:00');
  }
  return new Date(dateStr);
}

/**
 * Format a UTC date string to the user's local timezone.
 * Output: "July 26, 2026 14:30" or "26 de julio de 2026 14:30"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  const date = normalizeDate(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const locale = getLocale();

  const datePart = date.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${datePart} ${hours}:${minutes}`;
}

/**
 * Format just the date portion: "July 26, 2026" or "26 de julio de 2026"
 */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  const date = normalizeDate(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString(getLocale(), {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format month + year: "July 2026" or "julio 2026"
 */
export function formatMonthYear(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? normalizeDate(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString(getLocale(), {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format relative time: "3 days ago", "in 5 days", "today"
 * Uses i18n-aware labels
 */
export function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  const date = normalizeDate(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const locale = getLocale();

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (Math.abs(diffDays) < 1) return rtf.format(0, 'day'); // "today" / "hoy"
    if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
    if (Math.abs(diffDays) < 365) return rtf.format(Math.round(diffDays / 30), 'month');
    return rtf.format(Math.round(diffDays / 365), 'year');
  } catch {
    // Fallback if Intl.RelativeTimeFormat is not available
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  }
}

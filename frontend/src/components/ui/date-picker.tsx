import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/dates';
import { Button } from '@/components/ui/button';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

const YEARS_RANGE = 20;

export function DatePicker({ value, onChange, placeholder, required, id }: DatePickerProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(value ? new Date(value + 'T12:00:00') : new Date());
  const [showYearMonth, setShowYearMonth] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value + 'T12:00:00') : undefined;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      onChange(`${y}-${m}-${d}`);
    }
    setOpen(false);
    setShowYearMonth(false);
  };

  const handleToday = () => {
    const today = new Date();
    setMonth(today);
    handleSelect(today);
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
    setShowYearMonth(false);
  };

  const handleYearMonthSelect = (year: number, monthIdx: number) => {
    setMonth(new Date(year, monthIdx, 1));
    setShowYearMonth(false);
  };

  // Position the popover relative to the trigger (desktop only)
  useEffect(() => {
    if (!open || isMobile || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const popoverHeight = 360;

    if (spaceBelow >= popoverHeight || spaceBelow > spaceAbove) {
      setPopoverStyle({ top: rect.bottom + 4, left: rect.left });
    } else {
      setPopoverStyle({ bottom: window.innerHeight - rect.top + 4, left: rect.left });
    }
  }, [open, isMobile]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) return;
      setOpen(false);
      setShowYearMonth(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setShowYearMonth(false); }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, isMobile]);

  useEffect(() => {
    if (value) setMonth(new Date(value + 'T12:00:00'));
  }, [value]);

  const locale = i18n.language?.startsWith('es') ? 'es' : 'en';
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: YEARS_RANGE * 2 + 1 }, (_, i) => currentYear - YEARS_RANGE + i);
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(2024, i, 1).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'long' })
  );

  const calendarContent = (
    <div ref={popoverRef}>
      {showYearMonth ? (
        <div className="p-4 w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Select</span>
            <Button variant="ghost" size="sm" onClick={() => setShowYearMonth(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="mb-3">
            <div className="grid grid-cols-4 gap-1 max-h-[120px] overflow-y-auto">
              {years.map((y) => (
                <button key={y} type="button" onClick={() => handleYearMonthSelect(y, month.getMonth())}
                  className={cn('px-2 py-1.5 text-xs rounded-md transition-colors', y === month.getFullYear() ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {months.map((m, idx) => (
              <button key={idx} type="button" onClick={() => handleYearMonthSelect(month.getFullYear(), idx)}
                className={cn('px-2 py-1.5 text-xs rounded-md transition-colors capitalize', idx === month.getMonth() ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button type="button" onClick={() => setShowYearMonth(true)}
              className="text-sm font-semibold hover:bg-accent px-2 py-1 rounded-md transition-colors capitalize">
              {month.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' })}
            </button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            hideNavigation
            classNames={{
              root: 'text-sm',
              months: 'flex flex-col',
              month_caption: 'hidden',
              nav: 'hidden',
              weekdays: 'grid grid-cols-7',
              weekday: 'text-muted-foreground text-xs font-medium text-center w-9 py-1',
              weeks: '',
              week: 'grid grid-cols-7',
              day: 'text-center',
              day_button: 'h-9 w-9 rounded-lg text-sm font-normal hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center',
              selected: '!bg-primary !text-primary-foreground hover:!bg-primary font-medium',
              today: 'font-bold text-primary',
              outside: 'text-muted-foreground/40',
              disabled: 'text-muted-foreground/30 cursor-not-allowed',
            }}
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <Button variant="ghost" size="sm" className="text-xs" onClick={handleToday}>Today</Button>
            {value && <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={handleClear}>Clear</Button>}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        ref={triggerRef}
        id={id}
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          !value && 'text-muted-foreground',
        )}
      >
        <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
        <span className="flex-1 text-left truncate">
          {value ? formatDateShort(value + 'T12:00:00') : (placeholder || 'Select date')}
        </span>
        {value && (
          <span className="ml-1 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); handleClear(); }}>
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {required && <input type="text" value={value} required className="sr-only" tabIndex={-1} readOnly />}

      {/* Desktop: Portal popover positioned above everything */}
      {open && !isMobile && createPortal(
        <div
          style={popoverStyle}
          className="fixed z-[200] bg-card border rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {calendarContent}
        </div>,
        document.body,
      )}

      {/* Mobile: Centered modal */}
      {open && isMobile && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50" onClick={() => { setOpen(false); setShowYearMonth(false); }} />
          <div className="relative bg-card rounded-xl shadow-lg border animate-in fade-in zoom-in-95 duration-200">
            {calendarContent}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

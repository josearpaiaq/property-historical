import { Calendar, DollarSign, Pencil, Trash2, Paperclip, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirm } from '@/hooks/use-confirm';
import { PropertyEvent } from '@/hooks/use-events';
import { EventAttachments } from '@/components/EventAttachments';
import { cn } from '@/lib/utils';
import { formatDateShort, formatMonthYear } from '@/lib/dates';
import { useState } from 'react';

const categoryColors: Record<string, { dot: string; badge: string }> = {
  plumbing: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
  electrical: { dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
  structural: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
  hvac: { dot: 'bg-cyan-500', badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300' },
  painting: { dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
  landscaping: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  appliances: { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' },
  general: { dot: 'bg-primary', badge: 'bg-secondary text-secondary-foreground' },
  other: { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
};

const statusStyles: Record<string, string> = {
  planned: 'border-amber-300 dark:border-amber-600',
  'in-progress': 'border-blue-300 dark:border-blue-600',
  completed: 'border-green-300 dark:border-green-600',
};

interface TimelineProps {
  events: PropertyEvent[];
  onEdit: (event: PropertyEvent) => void;
  onDelete: (id: string) => void;
  onStatusChange: (event: PropertyEvent, status: string) => void;
  t: ReturnType<typeof useTranslation>['t'];
}

export function Timeline({ events, onEdit, onDelete, onStatusChange, t }: TimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { dialogProps, confirm } = useConfirm();

  // Group events by month/year
  const grouped = events.reduce<Record<string, PropertyEvent[]>>((acc, event) => {
    const dateStr = /^\d{4}-\d{2}-\d{2}$/.test(event.date) ? event.date + 'T12:00:00' : event.date;
    const date = new Date(dateStr);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8">
      {sortedMonths.map((monthKey) => {
        const [year, month] = monthKey.split('-');
        const monthDate = new Date(Number(year), Number(month) - 1);
        const monthLabel = formatMonthYear(monthDate);

        return (
          <div key={monthKey}>
            {/* Month header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                {monthLabel}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Timeline track */}
            <div className="relative pl-8 md:pl-10">
              {/* Vertical line */}
              <div className="absolute left-[0.9375rem] md:left-[1.1875rem] top-2 bottom-2 w-px bg-border" />

              <div className="space-y-4">
                {grouped[monthKey].map((event) => {
                  const colors = categoryColors[event.category || 'general'] || categoryColors.general;
                  const isExpanded = expandedId === event.id;

                  return (
                    <div key={event.id} className="relative">
                      {/* Node dot */}
                      <div
                        className={cn(
                          'absolute left-[-1.0625rem] md:left-[-1.3125rem] top-4 w-3 h-3 rounded-full ring-[3px] ring-background z-10',
                          colors.dot,
                        )}
                      />

                      {/* Event card */}
                      <div
                        className={cn(
                          'rounded-xl border-l-[3px] bg-card p-4 shadow-sm transition-all',
                          statusStyles[event.status || 'planned'],
                        )}
                      >
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm md:text-base leading-tight">
                              {event.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDateShort(event.date)}
                              </span>
                              {event.cost && (
                                <span className="text-xs font-medium flex items-center gap-0.5">
                                  <DollarSign className="h-3 w-3" />
                                  {Number(event.cost).toFixed(2)}
                                </span>
                              )}
                              {event.category && (
                                <span className={cn('px-2 py-0.5 text-[0.65rem] font-medium rounded-full', colors.badge)}>
                                  {t(`events.categories.${event.category}`)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions - always visible, styled subtly */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Select value={event.status || 'planned'} onValueChange={(val) => onStatusChange(event, val)}>
                              <SelectTrigger className="h-7 text-[0.65rem] px-2 w-auto gap-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planned">{t('events.statuses.planned')}</SelectItem>
                                <SelectItem value="in-progress">{t('events.statuses.in-progress')}</SelectItem>
                                <SelectItem value="completed">{t('events.statuses.completed')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(event)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => confirm({ title: t('common.delete') + '?', description: event.title, confirmLabel: t('common.delete'), variant: 'destructive', onConfirm: () => onDelete(event.id) })}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Description */}
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        {/* Expand toggle for attachments */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : event.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors"
                        >
                          <Paperclip className="h-3 w-3" />
                          <span>{t('attachments.title')}</span>
                          <ChevronDown className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')} />
                        </button>

                        {/* Attachments panel */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t">
                            <EventAttachments eventId={event.id} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      <ConfirmDialog {...dialogProps} cancelLabel={t('common.cancel')} />
    </div>
  );
}

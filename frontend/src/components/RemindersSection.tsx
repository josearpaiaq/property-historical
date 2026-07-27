import { useState } from 'react';
import { Bell, Plus, Check, Pencil, Trash2, Clock, Pause, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirm } from '@/hooks/use-confirm';
import { usePropertyReminders, useUpdateReminder, useDeleteReminder, useCompleteReminder, Reminder } from '@/hooks/use-reminders';
import { ReminderFormModal } from '@/components/ReminderFormModal';
import { cn } from '@/lib/utils';
import { formatDateShort, formatRelative } from '@/lib/dates';

interface RemindersSectionProps {
  propertyId: string;
}

export function RemindersSection({ propertyId }: RemindersSectionProps) {
  const { t } = useTranslation();
  const { data: reminders, isLoading } = usePropertyReminders(propertyId);
  const updateReminder = useUpdateReminder(propertyId);
  const deleteReminder = useDeleteReminder(propertyId);
  const completeReminder = useCompleteReminder(propertyId);
  const { dialogProps, confirm } = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const toggleActive = (reminder: Reminder) => {
    updateReminder.mutate({ id: reminder.id, data: { isActive: !reminder.isActive } });
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditingReminder(null);
    setModalOpen(true);
  };

  const isOverdue = (nextDueAt: string) => new Date(nextDueAt) < new Date();
  const daysUntilDue = (nextDueAt: string) => {
    const diff = new Date(nextDueAt).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t('reminders.title')}
        </h2>
        <Button size="sm" onClick={handleNew}>
          <Plus className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">{t('reminders.add')}</span>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : !reminders || reminders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium">{t('reminders.noReminders')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('reminders.noRemindersHint')}</p>
            <Button size="sm" className="mt-4" onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />{t('reminders.add')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const overdue = isOverdue(reminder.nextDueAt);
            const daysLeft = daysUntilDue(reminder.nextDueAt);

            return (
              <Card key={reminder.id} className={cn(!reminder.isActive && 'opacity-60')}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        'h-8 w-8 shrink-0 mt-0.5 rounded-full',
                        overdue && reminder.isActive && 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground',
                      )}
                      onClick={() => completeReminder.mutate({ id: reminder.id })}
                      disabled={completeReminder.isPending}
                      title={t('reminders.markComplete')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={cn('font-semibold text-sm', !reminder.isActive && 'line-through')}>{reminder.title}</h3>
                        {!reminder.isActive && (
                          <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t('reminders.paused')}</span>
                        )}
                      </div>
                      {reminder.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{reminder.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Every {reminder.frequencyDays} days
                        </span>
                        <span className={cn(
                          'font-medium',
                          overdue && reminder.isActive ? 'text-destructive' : daysLeft <= 7 && reminder.isActive ? 'text-amber-600 dark:text-amber-400' : '',
                        )}>
                          {formatRelative(reminder.nextDueAt)}
                        </span>
                        {reminder.lastCompletedAt && (
                          <span>Last: {formatDateShort(reminder.lastCompletedAt)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => toggleActive(reminder)} title={reminder.isActive ? 'Pause' : 'Resume'}>
                        {reminder.isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => handleEdit(reminder)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => confirm({ title: t('common.delete') + '?', description: reminder.title, confirmLabel: t('common.delete'), variant: 'destructive', onConfirm: () => deleteReminder.mutate(reminder.id) })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ReminderFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingReminder(null); }}
        propertyId={propertyId}
        reminder={editingReminder}
      />
      <ConfirmDialog {...dialogProps} cancelLabel={t('common.cancel')} />
    </div>
  );
}

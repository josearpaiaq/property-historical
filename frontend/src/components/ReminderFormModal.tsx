import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCreateReminder, useUpdateReminder, Reminder } from '@/hooks/use-reminders';

const frequencyOptions = [
  { days: '7', label: '1 week' },
  { days: '14', label: '2 weeks' },
  { days: '30', label: '1 month' },
  { days: '60', label: '2 months' },
  { days: '90', label: '3 months' },
  { days: '180', label: '6 months' },
  { days: '365', label: '1 year' },
];

interface ReminderFormModalProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  reminder?: Reminder | null;
}

export function ReminderFormModal({ open, onClose, propertyId, reminder }: ReminderFormModalProps) {
  const { t } = useTranslation();
  const createReminder = useCreateReminder(propertyId);
  const updateReminder = useUpdateReminder(propertyId);

  const [formData, setFormData] = useState({
    title: '', description: '', frequencyDays: '30',
    nextDueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title, description: reminder.description || '',
        frequencyDays: String(reminder.frequencyDays),
        nextDueAt: reminder.nextDueAt.split('T')[0],
      });
    } else {
      setFormData({
        title: '', description: '', frequencyDays: '30',
        nextDueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
  }, [reminder, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      frequencyDays: Number(formData.frequencyDays),
      nextDueAt: new Date(formData.nextDueAt + 'T12:00:00').toISOString(),
    };
    if (reminder) {
      updateReminder.mutate({ id: reminder.id, data: payload }, { onSuccess: onClose });
    } else {
      createReminder.mutate(payload, { onSuccess: onClose });
    }
  };

  const handleFrequencyChange = (val: string) => {
    const days = Number(val);
    setFormData({
      ...formData,
      frequencyDays: val,
      nextDueAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const isPending = createReminder.isPending || updateReminder.isPending;

  return (
    <FormModal open={open} onClose={onClose} title={reminder ? t('common.edit') : t('reminders.new')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>{t('reminders.reminderTitle')} *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={t('reminders.titlePlaceholder')}
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label>{t('events.description')}</Label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional notes..."
          />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('reminders.frequency')}</Label>
            <Select value={formData.frequencyDays} onValueChange={handleFrequencyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map(opt => (
                  <SelectItem key={opt.days} value={opt.days}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('reminders.nextDue')}</Label>
            <DatePicker value={formData.nextDueAt} onChange={(val) => setFormData({ ...formData, nextDueAt: val })} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>{isPending ? t('common.saving') : t('common.save')}</Button>
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
        </div>
      </form>
    </FormModal>
  );
}

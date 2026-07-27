import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCreateEvent, useUpdateEvent, PropertyEvent } from '@/hooks/use-events';

interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  event?: PropertyEvent | null;
}

export function EventFormModal({ open, onClose, propertyId, event }: EventFormModalProps) {
  const { t } = useTranslation();
  const createEvent = useCreateEvent(propertyId);
  const updateEvent = useUpdateEvent(propertyId);

  const [formData, setFormData] = useState({
    title: '', description: '', date: new Date().toISOString().split('T')[0],
    cost: '', category: 'general', status: 'completed',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title, description: event.description || '',
        date: event.date, cost: event.cost || '',
        category: event.category || 'general', status: event.status || 'completed',
      });
    } else {
      setFormData({
        title: '', description: '', date: new Date().toISOString().split('T')[0],
        cost: '', category: 'general', status: 'completed',
      });
    }
  }, [event, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, cost: formData.cost || undefined };
    if (event) {
      updateEvent.mutate({ id: event.id, data: payload }, { onSuccess: onClose });
    } else {
      createEvent.mutate(payload, { onSuccess: onClose });
    }
  };

  const isPending = createEvent.isPending || updateEvent.isPending;
  const categories = ['plumbing','electrical','structural','hvac','painting','landscaping','appliances','general','other'];

  return (
    <FormModal open={open} onClose={onClose} title={event ? t('common.edit') : t('events.newEvent')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>{t('events.title')} *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={t('events.titlePlaceholder')}
            required
            autoFocus
          />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('events.date')} *</Label>
            <DatePicker value={formData.date} onChange={(val) => setFormData({ ...formData, date: val })} required />
          </div>
          <div className="space-y-2">
            <Label>{t('events.cost')}</Label>
            <Input type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} placeholder={t('events.costPlaceholder')} />
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('events.category')}</Label>
            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{t(`events.categories.${c}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('events.status')}</Label>
            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">{t('events.statuses.planned')}</SelectItem>
                <SelectItem value="in-progress">{t('events.statuses.in-progress')}</SelectItem>
                <SelectItem value="completed">{t('events.statuses.completed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('events.description')}</Label>
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('events.descriptionPlaceholder')}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>{isPending ? t('common.saving') : t('common.save')}</Button>
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
        </div>
      </form>
    </FormModal>
  );
}

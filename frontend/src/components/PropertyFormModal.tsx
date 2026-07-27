import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormModal } from '@/components/ui/form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCreateProperty, useUpdateProperty, Property } from '@/hooks/use-properties';

interface PropertyFormModalProps {
  open: boolean;
  onClose: () => void;
  property?: Property | null;
}

export function PropertyFormModal({ open, onClose, property }: PropertyFormModalProps) {
  const { t } = useTranslation();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();

  const [formData, setFormData] = useState({ name: '', address: '', type: '', notes: '' });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name, address: property.address || '',
        type: property.type || '', notes: property.notes || '',
      });
    } else {
      setFormData({ name: '', address: '', type: '', notes: '' });
    }
  }, [property, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      address: formData.address || undefined,
      type: formData.type || undefined,
      notes: formData.notes || undefined,
    };
    if (property) {
      updateProperty.mutate({ id: property.id, data: payload }, { onSuccess: onClose });
    } else {
      createProperty.mutate(payload, { onSuccess: onClose });
    }
  };

  const isPending = createProperty.isPending || updateProperty.isPending;

  return (
    <FormModal open={open} onClose={onClose} title={property ? t('common.edit') : t('properties.newProperty')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>{t('properties.name')} *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('properties.namePlaceholder')}
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label>{t('properties.address')}</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder={t('properties.addressPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('properties.type')}</Label>
          <Select value={formData.type || '_none'} onValueChange={(val) => setFormData({ ...formData, type: val === '_none' ? '' : val })}>
            <SelectTrigger>
              <SelectValue placeholder={t('properties.selectType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">{t('properties.selectType')}</SelectItem>
              <SelectItem value="house">{t('properties.types.house')}</SelectItem>
              <SelectItem value="apartment">{t('properties.types.apartment')}</SelectItem>
              <SelectItem value="land">{t('properties.types.land')}</SelectItem>
              <SelectItem value="commercial">{t('properties.types.commercial')}</SelectItem>
              <SelectItem value="other">{t('properties.types.other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('events.description')}</Label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notes..."
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

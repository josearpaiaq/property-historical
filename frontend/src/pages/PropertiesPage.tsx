import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirm } from '@/hooks/use-confirm';
import { useProperties, useDeleteProperty, Property } from '@/hooks/use-properties';
import { PropertyFormModal } from '@/components/PropertyFormModal';
import { formatDateShort } from '@/lib/dates';

export function PropertiesPage() {
  const { t } = useTranslation();
  const { data: properties, isLoading } = useProperties();
  const deleteProperty = useDeleteProperty();
  const { dialogProps, confirm } = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const handleNew = () => {
    setEditingProperty(null);
    setModalOpen(true);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold">{t('properties.title')}</h1>
          <p className="text-muted-foreground text-sm hidden sm:block">{t('properties.subtitle')}</p>
        </div>
        <Button onClick={handleNew} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{t('properties.addProperty')}</span>
          <span className="sm:hidden">{t('properties.add')}</span>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : properties?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">{t('properties.noProperties')}</p>
            <Button size="sm" className="mt-4" onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />{t('properties.addProperty')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {properties?.map((property) => (
            <Card key={property.id} className="relative group">
              <Link to={`/properties/${property.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg pr-16">{property.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{property.address || t('properties.noAddress')}</p>
                  {property.type && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-secondary rounded-md">
                      {t(`properties.types.${property.type}`)}
                    </span>
                  )}
                  {property.purchaseDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('properties.purchased')}: {formatDateShort(property.purchaseDate)}
                    </p>
                  )}
                </CardContent>
              </Link>
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => { e.preventDefault(); handleEdit(property); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    confirm({
                      title: t('common.delete') + ' "' + property.name + '"?',
                      description: t('properties.deleteConfirm'),
                      confirmLabel: t('common.delete'),
                      variant: 'destructive',
                      onConfirm: () => deleteProperty.mutate(property.id),
                    });
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PropertyFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProperty(null); }}
        property={editingProperty}
      />
      <ConfirmDialog {...dialogProps} cancelLabel={t('common.cancel')} />
    </div>
  );
}

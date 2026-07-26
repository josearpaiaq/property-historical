import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProperties, useCreateProperty, useDeleteProperty } from '@/hooks/use-properties';

export function PropertiesPage() {
  const { t } = useTranslation();
  const { data: properties, isLoading } = useProperties();
  const createProperty = useCreateProperty();
  const deleteProperty = useDeleteProperty();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', type: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createProperty.mutate(
      { name: formData.name, address: formData.address || undefined, type: formData.type || undefined },
      {
        onSuccess: () => {
          setFormData({ name: '', address: '', type: '' });
          setShowForm(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold">{t('properties.title')}</h1>
          <p className="text-muted-foreground text-sm hidden sm:block">{t('properties.subtitle')}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{t('properties.addProperty')}</span>
          <span className="sm:hidden">{t('properties.add')}</span>
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t('properties.newProperty')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('properties.name')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('properties.namePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t('properties.address')}</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={t('properties.addressPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t('properties.type')}</Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="">{t('properties.selectType')}</option>
                    <option value="house">{t('properties.types.house')}</option>
                    <option value="apartment">{t('properties.types.apartment')}</option>
                    <option value="land">{t('properties.types.land')}</option>
                    <option value="commercial">{t('properties.types.commercial')}</option>
                    <option value="other">{t('properties.types.other')}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createProperty.isPending}>
                  {createProperty.isPending ? t('common.creating') : t('common.create')}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : properties?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">{t('properties.noProperties')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {properties?.map((property) => (
            <Card key={property.id} className="relative group">
              <Link to={`/properties/${property.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg pr-8">{property.name}</CardTitle>
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
                      {t('properties.purchased')}: {new Date(property.purchaseDate).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                onClick={() => deleteProperty.mutate(property.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

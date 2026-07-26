import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProperty } from '@/hooks/use-properties';
import { api } from '@/lib/api';

interface Event {
  id: string;
  propertyId: string;
  title: string;
  description: string | null;
  date: string;
  cost: string | null;
  category: string | null;
  status: string | null;
  createdAt: string;
}

function usePropertyEvents(propertyId: string) {
  return useQuery({
    queryKey: ['events', propertyId],
    queryFn: async () => {
      const res = await api.get<Event[]>(`/properties/${propertyId}/events`);
      return res.data;
    },
    enabled: !!propertyId,
  });
}

const categoryColors: Record<string, string> = {
  plumbing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  electrical: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  structural: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  hvac: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  painting: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  landscaping: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  appliances: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export function PropertyDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading: propertyLoading } = useProperty(id!);
  const { data: events, isLoading: eventsLoading } = usePropertyEvents(id!);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    cost: '',
    category: 'general',
    status: 'completed',
  });

  const createEvent = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post(`/properties/${id}/events`, {
        ...data,
        cost: data.cost || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        cost: '',
        category: 'general',
        status: 'completed',
      });
    },
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent.mutate(formData);
  };

  if (propertyLoading) return <p className="text-muted-foreground">{t('common.loading')}</p>;
  if (!property) return <p>Property not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
          <Link to="/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold truncate">{property.name}</h1>
          <p className="text-muted-foreground text-sm">
            {property.address || t('properties.noAddress')}{' '}
            {property.type && <span>• {t(`properties.types.${property.type}`)}</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold">{t('events.timeline')}</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{t('events.logEvent')}</span>
          <span className="sm:hidden">{t('events.log')}</span>
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t('events.newEvent')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('events.title')} *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('events.titlePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">{t('events.date')} *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">{t('events.cost')}</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder={t('events.costPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{t('events.category')}</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="plumbing">{t('events.categories.plumbing')}</option>
                    <option value="electrical">{t('events.categories.electrical')}</option>
                    <option value="structural">{t('events.categories.structural')}</option>
                    <option value="hvac">{t('events.categories.hvac')}</option>
                    <option value="painting">{t('events.categories.painting')}</option>
                    <option value="landscaping">{t('events.categories.landscaping')}</option>
                    <option value="appliances">{t('events.categories.appliances')}</option>
                    <option value="general">{t('events.categories.general')}</option>
                    <option value="other">{t('events.categories.other')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t('events.status')}</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="planned">{t('events.statuses.planned')}</option>
                    <option value="in-progress">{t('events.statuses.in-progress')}</option>
                    <option value="completed">{t('events.statuses.completed')}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('events.description')}</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('events.descriptionPlaceholder')}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createEvent.isPending}>
                  {createEvent.isPending ? t('common.saving') : t('common.save')}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {eventsLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : events?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('events.noEvents')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events?.map((event) => (
            <Card key={event.id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm md:text-base">{event.title}</h3>
                    {event.category && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[event.category] || categoryColors.other}`}>
                        {t(`events.categories.${event.category}`)}
                      </span>
                    )}
                    {event.status && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-secondary">
                        {t(`events.statuses.${event.status}`)}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  )}
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 text-sm shrink-0">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  {event.cost && (
                    <div className="flex items-center gap-1 font-medium">
                      <DollarSign className="h-3 w-3" />
                      {Number(event.cost).toFixed(2)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

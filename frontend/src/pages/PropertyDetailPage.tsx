import { useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, DollarSign, Pencil, Trash2, Filter, LayoutList, LayoutGrid, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useProperty } from '@/hooks/use-properties';
import { usePropertyEvents, useUpdateEvent, useDeleteEvent, PropertyEvent } from '@/hooks/use-events';
import { Timeline } from '@/components/Timeline';
import { RemindersSection } from '@/components/RemindersSection';
import { EventFormModal } from '@/components/EventFormModal';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/dates';

type ViewMode = 'timeline' | 'grid';
type Tab = 'events' | 'reminders';

export function PropertyDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { data: property, isLoading: propertyLoading } = useProperty(id!);
  const { data: events, isLoading: eventsLoading } = usePropertyEvents(id!);
  const updateEvent = useUpdateEvent(id!);
  const deleteEvent = useDeleteEvent(id!);

  const initialTab = searchParams.get('tab') === 'reminders' ? 'reminders' : 'events';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PropertyEvent | null>(null);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((event) => {
      if (filters.category && event.category !== filters.category) return false;
      if (filters.status && event.status !== filters.status) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!event.title.toLowerCase().includes(s) && !event.description?.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [events, filters]);

  const handleStatusChange = (event: PropertyEvent, newStatus: string) => {
    updateEvent.mutate({ id: event.id, data: { status: newStatus } });
  };

  const handleEditEvent = (event: PropertyEvent) => {
    setEditingEvent(event);
    setEventModalOpen(true);
  };

  const handleNewEvent = () => {
    setEditingEvent(null);
    setEventModalOpen(true);
  };

  if (propertyLoading) return <p className="text-muted-foreground p-8">{t('common.loading')}</p>;
  if (!property) return <p className="p-8">Property not found</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
          <Link to="/properties"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold truncate">{property.name}</h1>
          <p className="text-muted-foreground text-sm">
            {property.address || t('properties.noAddress')}
            {property.type && <span> • {t(`properties.types.${property.type}`)}</span>}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab('events')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'events' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {t('events.timeline')}
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5',
            activeTab === 'reminders' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <Bell className="h-3.5 w-3.5" />
          {t('reminders.title')}
        </button>
      </div>

      {activeTab === 'reminders' ? (
        <RemindersSection propertyId={id!} />
      ) : (
      <>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'bg-accent' : ''}>
              <Filter className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <div className="flex border rounded-lg overflow-hidden">
              <Button variant={viewMode === 'timeline' ? 'default' : 'ghost'} size="sm" className="rounded-none px-2.5" onClick={() => setViewMode('timeline')}>
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="rounded-none px-2.5" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button size="sm" onClick={handleNewEvent}>
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t('events.logEvent')}</span>
            <span className="sm:hidden">{t('events.log')}</span>
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="py-4">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                <Input placeholder="Search..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                <Select value={filters.category || '_all'} onValueChange={(val) => setFilters({ ...filters, category: val === '_all' ? '' : val })}>
                  <SelectTrigger><SelectValue placeholder={t('events.category') + ' - All'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">{t('events.category')} - All</SelectItem>
                    {['plumbing','electrical','structural','hvac','painting','landscaping','appliances','general','other'].map(c => (
                      <SelectItem key={c} value={c}>{t(`events.categories.${c}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.status || '_all'} onValueChange={(val) => setFilters({ ...filters, status: val === '_all' ? '' : val })}>
                  <SelectTrigger><SelectValue placeholder={t('events.status') + ' - All'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">{t('events.status')} - All</SelectItem>
                    <SelectItem value="planned">{t('events.statuses.planned')}</SelectItem>
                    <SelectItem value="in-progress">{t('events.statuses.in-progress')}</SelectItem>
                    <SelectItem value="completed">{t('events.statuses.completed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events Display */}
        {eventsLoading ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">{t('events.noEvents')}</p>
              <Button size="sm" className="mt-4" onClick={handleNewEvent}>
                <Plus className="h-4 w-4 mr-2" />{t('events.logEvent')}
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'timeline' ? (
          <Timeline
            events={filteredEvents}
            onEdit={handleEditEvent}
            onDelete={(eventId) => deleteEvent.mutate(eventId)}
            onStatusChange={handleStatusChange}
            t={t}
          />
        ) : (
          /* Grid view */
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const catColors: Record<string, string> = {
                plumbing: 'border-l-blue-500', electrical: 'border-l-yellow-500', structural: 'border-l-red-500',
                hvac: 'border-l-cyan-500', painting: 'border-l-purple-500', landscaping: 'border-l-green-500',
                appliances: 'border-l-orange-500', general: 'border-l-primary', other: 'border-l-gray-400',
              };
              return (
                <Card key={event.id} className={`border-l-[3px] ${catColors[event.category || 'general']}`}>
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-tight">{event.title}</h3>
                      <div className="flex gap-0.5 shrink-0">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => handleEditEvent(event)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteEvent.mutate(event.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {event.description && <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{formatDateShort(event.date)}
                      </span>
                      {event.cost && <span className="font-medium flex items-center gap-0.5"><DollarSign className="h-3 w-3" />{Number(event.cost).toFixed(2)}</span>}
                    </div>
                    <Select value={event.status || 'planned'} onValueChange={(val) => handleStatusChange(event, val)}>
                      <SelectTrigger className="h-7 text-[0.65rem] px-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">{t('events.statuses.planned')}</SelectItem>
                        <SelectItem value="in-progress">{t('events.statuses.in-progress')}</SelectItem>
                        <SelectItem value="completed">{t('events.statuses.completed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </>
      )}

      <EventFormModal
        open={eventModalOpen}
        onClose={() => { setEventModalOpen(false); setEditingEvent(null); }}
        propertyId={id!}
        event={editingEvent}
      />
    </div>
  );
}

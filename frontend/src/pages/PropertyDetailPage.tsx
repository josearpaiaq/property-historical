import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, DollarSign } from 'lucide-react';
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
  plumbing: 'bg-blue-100 text-blue-800',
  electrical: 'bg-yellow-100 text-yellow-800',
  structural: 'bg-red-100 text-red-800',
  hvac: 'bg-cyan-100 text-cyan-800',
  painting: 'bg-purple-100 text-purple-800',
  landscaping: 'bg-green-100 text-green-800',
  appliances: 'bg-orange-100 text-orange-800',
  general: 'bg-gray-100 text-gray-800',
  other: 'bg-gray-100 text-gray-800',
};

export function PropertyDetailPage() {
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

  if (propertyLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!property) return <p>Property not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{property.name}</h1>
          <p className="text-muted-foreground">
            {property.address || 'No address'}{' '}
            {property.type && <span className="capitalize">• {property.type}</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Event Timeline</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Event
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Fixed leaking faucet"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="150.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="structural">Structural</option>
                    <option value="hvac">HVAC</option>
                    <option value="painting">Painting</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="appliances">Appliances</option>
                    <option value="general">General</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about the repair or change..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createEvent.isPending}>
                  {createEvent.isPending ? 'Saving...' : 'Save Event'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {eventsLoading ? (
        <p className="text-muted-foreground">Loading events...</p>
      ) : events?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No events logged yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events?.map((event) => (
            <Card key={event.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{event.title}</h3>
                    {event.category && (
                      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${categoryColors[event.category] || categoryColors.other}`}>
                        {event.category}
                      </span>
                    )}
                    {event.status && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-secondary capitalize">
                        {event.status}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
                <div className="text-right text-sm">
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

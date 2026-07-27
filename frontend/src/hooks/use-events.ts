import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface PropertyEvent {
  id: string;
  propertyId: string;
  title: string;
  description: string | null;
  date: string;
  cost: string | null;
  category: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

export function usePropertyEvents(propertyId: string) {
  return useQuery({
    queryKey: ['events', propertyId],
    queryFn: async () => {
      const res = await api.get<PropertyEvent[]>(`/properties/${propertyId}/events`);
      return res.data;
    },
    enabled: !!propertyId,
  });
}

export function useCreateEvent(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; description?: string; date: string; cost?: string; category?: string; status?: string }) => {
      const res = await api.post<PropertyEvent>(`/properties/${propertyId}/events`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', propertyId] });
    },
  });
}

export function useUpdateEvent(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ title: string; description: string; date: string; cost: string; category: string; status: string }> }) => {
      const res = await api.put<PropertyEvent>(`/events/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', propertyId] });
    },
  });
}

export function useDeleteEvent(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', propertyId] });
    },
  });
}

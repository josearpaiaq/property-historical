import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Reminder {
  id: string;
  propertyId: string;
  title: string;
  description: string | null;
  frequencyDays: number;
  lastCompletedAt: string | null;
  nextDueAt: string;
  isActive: boolean;
  createdAt: string;
}

export function usePropertyReminders(propertyId: string) {
  return useQuery({
    queryKey: ['reminders', propertyId],
    queryFn: async () => {
      const res = await api.get<Reminder[]>(`/properties/${propertyId}/reminders`);
      return res.data;
    },
    enabled: !!propertyId,
  });
}

export function useCreateReminder(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; frequencyDays: number; nextDueAt: string }) => {
      const res = await api.post<Reminder>(`/properties/${propertyId}/reminders`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', propertyId] });
    },
  });
}

export function useUpdateReminder(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ title: string; description: string; frequencyDays: number; nextDueAt: string; isActive: boolean }> }) => {
      const res = await api.put<Reminder>(`/reminders/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', propertyId] });
    },
  });
}

export function useDeleteReminder(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', propertyId] });
    },
  });
}

export function useCompleteReminder(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completedAt }: { id: string; completedAt?: string }) => {
      const res = await api.post(`/reminders/${id}/complete`, { completedAt });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['events', propertyId] });
    },
  });
}

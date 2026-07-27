import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { api } from '@/lib/api';

export interface Property {
  id: string;
  userId: string;
  name: string;
  address: string | null;
  type: string | null;
  purchaseDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await api.get<Property[]>('/properties');
      return res.data;
    },
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: async () => {
      const res = await api.get<Property>(`/properties/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; address?: string; type?: string; purchaseDate?: string; notes?: string }) => {
      const res = await api.post<Property>('/properties', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(i18n.t('toast.propertyCreated'));
    },
    onError: () => { toast.error(i18n.t('toast.propertyCreateError')); },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; address?: string; type?: string; purchaseDate?: string; notes?: string } }) => {
      const res = await api.put<Property>(`/properties/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(i18n.t('toast.propertyUpdated'));
    },
    onError: () => { toast.error(i18n.t('toast.propertyUpdateError')); },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(i18n.t('toast.propertyDeleted'));
    },
    onError: () => { toast.error(i18n.t('toast.propertyDeleteError')); },
  });
}

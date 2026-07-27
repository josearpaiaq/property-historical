import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

interface AuthResponse {
  access_token: string;
  user: { id: string; email: string; name: string };
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post<AuthResponse>('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
      toast.success(i18n.t('toast.loginSuccess', { name: data.user.name }));
    },
    onError: () => {
      toast.error(i18n.t('toast.loginError'));
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      const res = await api.post<AuthResponse>('/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
      toast.success(i18n.t('toast.registerSuccess'));
    },
    onError: () => {
      toast.error(i18n.t('toast.registerError'));
    },
  });
}

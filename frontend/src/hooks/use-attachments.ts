import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Attachment {
  id: string;
  eventId: string;
  fileName: string;
  s3Key: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
}

interface UploadResponse {
  attachment: Attachment;
  uploadUrl: string;
}

interface DownloadResponse {
  attachment: Attachment;
  downloadUrl: string;
}

export function useEventAttachments(eventId: string) {
  return useQuery({
    queryKey: ['attachments', eventId],
    queryFn: async () => {
      const res = await api.get<Attachment[]>(`/events/${eventId}/attachments`);
      return res.data;
    },
    enabled: !!eventId,
  });
}

export function useUploadAttachment(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // 1. Get pre-signed upload URL from backend (this also saves metadata to DB)
      const res = await api.post<UploadResponse>(`/events/${eventId}/attachments`, {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // 2. Upload file directly to S3 using pre-signed URL
      const uploadResponse = await fetch(res.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.status}`);
      }

      return res.data.attachment;
    },
    onMutate: async (file) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['attachments', eventId] });

      // Snapshot previous value
      const previous = queryClient.getQueryData<Attachment[]>(['attachments', eventId]);

      // Optimistically add the file
      const optimistic: Attachment = {
        id: `temp-${Date.now()}`,
        eventId,
        fileName: file.name,
        s3Key: '',
        fileType: file.type,
        fileSize: file.size,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Attachment[]>(['attachments', eventId], (old) => [
        ...(old || []),
        optimistic,
      ]);

      return { previous };
    },
    onError: (_err, _file, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['attachments', eventId], context.previous);
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles to get real data
      queryClient.invalidateQueries({ queryKey: ['attachments', eventId] });
    },
  });
}

export function useDownloadAttachment() {
  return useMutation({
    mutationFn: async (attachmentId: string) => {
      const res = await api.get<DownloadResponse>(`/attachments/${attachmentId}`);
      return res.data;
    },
  });
}

export function useDeleteAttachment(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      await api.delete(`/attachments/${attachmentId}`);
    },
    onMutate: async (attachmentId) => {
      await queryClient.cancelQueries({ queryKey: ['attachments', eventId] });
      const previous = queryClient.getQueryData<Attachment[]>(['attachments', eventId]);
      queryClient.setQueryData<Attachment[]>(['attachments', eventId], (old) =>
        (old || []).filter((a) => a.id !== attachmentId),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['attachments', eventId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', eventId] });
    },
  });
}

import { useRef, useState } from 'react';
import { Paperclip, Upload, Download, Trash2, FileText, Image, File, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirm } from '@/hooks/use-confirm';
import { useEventAttachments, useUploadAttachment, useDownloadAttachment, useDeleteAttachment, Attachment } from '@/hooks/use-attachments';

function getFileIcon(fileType: string | null) {
  if (!fileType) return File;
  if (fileType.startsWith('image/')) return Image;
  if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
  return File;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPreviewable(fileType: string | null): boolean {
  if (!fileType) return false;
  return fileType.startsWith('image/') || fileType === 'application/pdf';
}

interface EventAttachmentsProps {
  eventId: string;
}

export function EventAttachments({ eventId }: EventAttachmentsProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: attachments, isLoading } = useEventAttachments(eventId);
  const upload = useUploadAttachment(eventId);
  const download = useDownloadAttachment();
  const deleteAttachment = useDeleteAttachment(eventId);
  const { dialogProps, confirm } = useConfirm();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach((file) => upload.mutate(file));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePreview = async (attachment: Attachment) => {
    const res = await download.mutateAsync(attachment.id);
    setPreviewUrl(res.downloadUrl);
    setPreviewType(attachment.fileType);
    setPreviewName(attachment.fileName);
  };

  const handleDownload = async (attachment: Attachment) => {
    const res = await download.mutateAsync(attachment.id);
    window.open(res.downloadUrl, '_blank');
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
    setPreviewName('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Paperclip className="h-4 w-4" />
          <span>{t('attachments.title')}</span>
          {attachments && attachments.length > 0 && (
            <span className="text-xs text-muted-foreground">({attachments.length})</span>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={upload.isPending}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            {upload.isPending ? t('attachments.uploading') : t('attachments.upload')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">{t('common.loading')}</p>
      ) : attachments && attachments.length > 0 ? (
        <div className="space-y-1.5">
          {attachments.map((attachment) => {
            const Icon = getFileIcon(attachment.fileType);
            const canPreview = isPreviewable(attachment.fileType);

            return (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 text-sm"
              >
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <button
                  className="flex-1 truncate text-left hover:underline cursor-pointer"
                  onClick={() => canPreview ? handlePreview(attachment) : handleDownload(attachment)}
                  title={canPreview ? 'Preview' : 'Download'}
                >
                  {attachment.fileName}
                </button>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatFileSize(attachment.fileSize)}
                </span>
                {canPreview && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground"
                    onClick={() => handlePreview(attachment)}
                    title="Preview"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground"
                  onClick={() => handleDownload(attachment)}
                  title="Download"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => confirm({
                    title: t('common.delete') + '?',
                    description: attachment.fileName,
                    confirmLabel: t('common.delete'),
                    variant: 'destructive',
                    onConfirm: () => deleteAttachment.mutate(attachment.id),
                  })}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Preview Modal */}
      <Modal
        open={!!previewUrl}
        onClose={closePreview}
        title={previewName}
        size="4xl"
        headerActions={
          <Button variant="ghost" size="sm" onClick={() => window.open(previewUrl!, '_blank')}>
            <Download className="h-4 w-4 mr-1" />
            {t('attachments.download')}
          </Button>
        }
      >
        <div className="flex items-center justify-center p-4 bg-muted/30 min-h-[400px]">
          {previewType?.startsWith('image/') ? (
            <img
              src={previewUrl!}
              alt={previewName}
              className="max-w-full max-h-[75vh] object-contain rounded-md"
            />
          ) : previewType === 'application/pdf' ? (
            <iframe
              src={previewUrl!}
              className="w-full h-[75vh] rounded-md border"
              title={previewName}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <File className="h-16 w-16 mx-auto mb-4" />
              <p>Cannot preview this file type</p>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog {...dialogProps} cancelLabel={t('common.cancel')} />
    </div>
  );
}

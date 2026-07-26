import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'warning' | 'default';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  loading = false,
}: ConfirmDialogProps) {
  const iconColors = {
    destructive: 'text-destructive bg-destructive/10',
    warning: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
    default: 'text-primary bg-primary/10',
  };

  const buttonVariants = {
    destructive: 'destructive' as const,
    warning: 'default' as const,
    default: 'default' as const,
  };

  return (
    <Modal open={open} onClose={onClose} showHeader={false} size="sm">
      <div className="p-6 space-y-4">
        {/* Icon + Title */}
        <div className="flex items-start gap-4">
          <div className={cn('shrink-0 w-10 h-10 rounded-full flex items-center justify-center', iconColors[variant])}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1 pt-0.5">
            <h3 className="font-semibold text-base leading-tight">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={buttonVariants[variant]}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

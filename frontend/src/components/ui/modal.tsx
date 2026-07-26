import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Max width class. Default: "sm:max-w-lg" */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
  /** Show header with title and close button. Default: true */
  showHeader?: boolean;
  /** Additional header content (right side) */
  headerActions?: React.ReactNode;
}

const sizeClasses: Record<string, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '4xl': 'sm:max-w-4xl',
  full: 'sm:max-w-[95vw]',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'lg',
  showHeader = true,
  headerActions,
}: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[100] flex items-start justify-center">
      {/* Backdrop - covers everything including fixed elements */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        className={cn(
          'relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:mt-[5vh]',
          'bg-card sm:rounded-xl sm:border sm:shadow-lg',
          'flex flex-col overflow-hidden',
          'animate-in fade-in slide-in-from-bottom-4 duration-200',
          sizeClasses[size],
        )}
      >
        {/* Header */}
        {showHeader && (
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b">
            {title && <h2 className="text-lg font-semibold truncate">{title}</h2>}
            <div className="flex items-center gap-2 ml-auto">
              {headerActions}
              <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

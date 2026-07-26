import { Modal } from '@/components/ui/modal';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function FormModal({ open, onClose, title, children }: FormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <div className="px-5 py-5">
        {children}
      </div>
    </Modal>
  );
}

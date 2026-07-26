import { useState, useCallback } from 'react';

interface ConfirmState {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'destructive' | 'warning' | 'default';
  onConfirm: () => void;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: '',
    onConfirm: () => {},
  });

  const confirm = useCallback(
    (opts: Omit<ConfirmState, 'open'>) => {
      setState({ ...opts, open: true });
    },
    [],
  );

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    state.onConfirm();
    close();
  }, [state, close]);

  return {
    dialogProps: {
      open: state.open,
      onClose: close,
      onConfirm: handleConfirm,
      title: state.title,
      description: state.description,
      confirmLabel: state.confirmLabel,
      variant: state.variant,
    },
    confirm,
  };
}

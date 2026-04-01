import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>
        <div className="modal-body">
          <p className="text-lawfy-text-soft text-sm mb-6">{message}</p>
          <div className="confirm-modal-actions">
            <Button
              variant="secondary"
              fullWidth={false}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              fullWidth={false}
              onClick={onConfirm}
              loading={isLoading}
            >
              Confirmar exclusão
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
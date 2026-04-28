import { type ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Bloqueia o scroll do body quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
  }[size];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-container ${sizeClass}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
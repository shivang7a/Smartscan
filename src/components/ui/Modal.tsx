import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} rounded-lg border border-ew-border bg-ew-panel/95 shadow-2xl shadow-cyan-950/40 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tactical Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-ew-cyan" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-ew-cyan" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-ew-cyan" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-ew-cyan" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ew-border bg-ew-bg/60">
          <div>
            <h2 className="font-mono text-sm font-bold tracking-wider uppercase text-ew-cyan flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ew-cyan animate-pulse" />
              {title}
            </h2>
            {subtitle && <p className="text-xs text-ew-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-ew-muted hover:text-ew-crimson hover:bg-ew-crimson/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 max-h-[80vh] overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

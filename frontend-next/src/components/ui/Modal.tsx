'use client';

import { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content
            className={cn(
              'w-full glass-card-dark rounded-2xl shadow-glass border border-white/10',
              'animate-scale-in focus:outline-none',
              sizes[size]
            )}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-4 border-b border-white/8">
                <div>
                  {title && (
                    <Dialog.Title className="text-base font-semibold text-white tracking-tight">
                      {title}
                    </Dialog.Title>
                  )}
                  {description && (
                    <Dialog.Description className="text-xs text-aeter-ink-mute mt-0.5">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
                {showCloseButton && (
                  <Dialog.Close
                    className="p-1 text-aeter-ink-mute hover:text-white transition-colors rounded-lg hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </Dialog.Close>
                )}
              </div>
            )}
            <div className="p-4">{children}</div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

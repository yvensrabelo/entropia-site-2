'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastProps {
  id?: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: 'text-green-500',
    closeButton: 'text-green-500 hover:text-green-700',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-500',
    closeButton: 'text-red-500 hover:text-red-700',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-500',
    closeButton: 'text-yellow-500 hover:text-yellow-700',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-500',
    closeButton: 'text-blue-500 hover:text-blue-700',
  },
};

export default function PremiumToast({ 
  title, 
  message, 
  type, 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const Icon = toastIcons[type];
  const styles = toastStyles[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`
            relative flex items-start p-4 border rounded-lg shadow-lg backdrop-blur-sm
            ${styles.container}
          `}
        >
          <Icon className={`flex-shrink-0 w-5 h-5 mt-0.5 mr-3 ${styles.icon}`} />
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-semibold mb-1">{title}</h4>
            )}
            <p className="text-sm leading-relaxed">{message}</p>
          </div>

          <button
            onClick={handleClose}
            className={`
              ml-3 flex-shrink-0 p-1 rounded-full transition-colors
              ${styles.closeButton}
            `}
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook para gerenciar toasts
export function useToast() {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  const handleError = (error: any, defaultMessage = 'Ocorreu um erro') => {
    let message = defaultMessage;
    let title = 'Erro';

    if (error?.message) {
      if (error.message.includes('403') || error.message.includes('permission') || error.message.includes('denied')) {
        message = 'Você não tem permissão para executar essa ação.';
        title = 'Acesso Negado';
      } else {
        message = error.message;
      }
    } else if (typeof error === 'string') {
      message = error;
    }

    return addToast({ type: 'error', message, title });
  };

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    handleError,
    success: (message: string, title?: string) => addToast({ type: 'success', message, title }),
    error: (message: string, title?: string) => addToast({ type: 'error', message, title }),
    warning: (message: string, title?: string) => addToast({ type: 'warning', message, title }),
    info: (message: string, title?: string) => addToast({ type: 'info', message, title }),
  };
}

// Container para toasts
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-3">
      {toasts.map((toast) => (
        <PremiumToast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
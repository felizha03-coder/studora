import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, variant }]);
      setTimeout(() => removeToast(id), 3400);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-20 md:bottom-6 right-4 z-[70] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const bg =
              t.variant === 'success'
                ? 'bg-[#B9F5C8]'
                : t.variant === 'error'
                ? 'bg-[#F5A9DD]'
                : 'bg-[#FFE69A]';
            const Icon =
              t.variant === 'success'
                ? CheckCircle2
                : t.variant === 'error'
                ? AlertTriangle
                : Info;

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] text-[#171717] ${bg}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="font-body text-sm font-semibold leading-snug break-words">
                    {t.message}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  aria-label="Dismiss notification"
                  className="p-1 rounded-md hover:bg-[#171717]/10 shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

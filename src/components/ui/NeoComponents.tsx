import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { PastelTone } from '../../types/studora';

export const TONE_CLASSES: Record<PastelTone, string> = {
  lavender: 'bg-[#A78BFA] text-[#171717] dark:bg-[#7C5DFA] dark:text-white',
  purple: 'bg-[#C4B5FD] text-[#171717] dark:bg-[#5E4BB6] dark:text-white',
  peach: 'bg-[#FFC98B] text-[#171717] dark:bg-[#D9823B] dark:text-[#171717]',
  mint: 'bg-[#B9F5C8] text-[#171717] dark:bg-[#2F855A] dark:text-white',
  pink: 'bg-[#F5A9DD] text-[#171717] dark:bg-[#B84A98] dark:text-white',
  yellow: 'bg-[#FFE69A] text-[#171717] dark:bg-[#D6A62A] dark:text-[#171717]',
  white: 'bg-white text-[#171717] dark:bg-[#1E1E26] dark:text-[#F5F3EE]',
};

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: PastelTone;
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export const NeoCard: React.FC<NeoCardProps> = ({
  tone = 'white',
  interactive = false,
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const padClass =
    padding === 'none'
      ? ''
      : padding === 'sm'
      ? 'p-4'
      : padding === 'lg'
      ? 'p-6 sm:p-7'
      : 'p-5';

  return (
    <div
      className={`neo-card ${interactive ? 'neo-card-interactive cursor-pointer' : ''} ${TONE_CLASSES[tone]} ${padClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: PastelTone | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  tone = 'lavender',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  const toneStyle =
    tone === 'dark'
      ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717]'
      : TONE_CLASSES[tone];

  const sizeStyle =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs min-h-[36px]'
      : size === 'lg'
      ? 'px-6 py-3 text-sm min-h-[46px]'
      : 'px-4 py-2 text-sm min-h-[40px]';

  return (
    <button
      type={type}
      className={`neo-btn inline-flex items-center justify-center gap-2 font-body font-bold whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717] ${toneStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface NeoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  tone?: PastelTone;
  maxWidth?: string;
  children: React.ReactNode;
}

export const NeoModal: React.FC<NeoModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  tone = 'white',
  maxWidth = 'max-w-xl',
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#171717]/55 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto neo-card ${TONE_CLASSES[tone]} p-6`}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-[#171717]/15 dark:border-white/15">
              <div>
                <h2 className="font-label text-sm sm:text-base font-bold tracking-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="font-body text-xs sm:text-sm opacity-75 mt-1">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="neo-btn w-9 h-9 flex items-center justify-center bg-white dark:bg-[#2A2A35] text-[#171717] dark:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="pt-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <NeoCard tone="white" className="text-center py-12 px-6 flex flex-col items-center justify-center">
      <svg
        width="84"
        height="84"
        viewBox="0 0 84 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-4"
        aria-hidden="true"
      >
        <rect x="14" y="18" width="56" height="48" rx="12" fill="#FFE69A" stroke="#171717" strokeWidth="2.5" />
        <rect x="22" y="28" width="28" height="7" rx="3.5" fill="#FFFFFF" stroke="#171717" strokeWidth="2" />
        <rect x="22" y="40" width="40" height="7" rx="3.5" fill="#B9F5C8" stroke="#171717" strokeWidth="2" />
        <circle cx="62" cy="22" r="10" fill="#A78BFA" stroke="#171717" strokeWidth="2.5" />
        <path d="M58 22H66M62 18V26" stroke="#171717" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <h3 className="font-label text-sm font-bold">{title}</h3>
      <p className="font-body text-sm opacity-75 max-w-md mt-2">{description}</p>
      {actionLabel && onAction && (
        <NeoButton tone="mint" onClick={onAction} className="mt-5">
          {actionLabel}
        </NeoButton>
      )}
    </NeoCard>
  );
};

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = 'h-24 w-full' }) => (
  <div
    className={`animate-pulse rounded-[16px] border-2 border-[#171717]/20 bg-[#EFE9DD] dark:bg-[#23232D] ${className}`}
  />
);

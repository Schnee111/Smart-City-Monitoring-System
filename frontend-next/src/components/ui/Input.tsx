'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/src/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, disabled, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-aeter-ink-soft"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-9 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-aeter-ink-mute/50 transition-all font-sans',
              'focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/25',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[11px] text-rose-400 font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-[11px] text-aeter-ink-mute">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;

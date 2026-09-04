'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, helperText, id, disabled, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-aeter-ink-soft"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-9 px-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-xs text-white appearance-none cursor-pointer transition-all font-sans',
              'focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/25',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#181c26] text-white">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-aeter-ink-mute">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
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

Select.displayName = 'Select';

export { Select };

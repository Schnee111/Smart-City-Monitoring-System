'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'grid' | 'solar';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white/10 text-aeter-ink border-white/10',
      success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      grid: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      solar: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-2.5 py-0.5 text-xs',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export default Badge;

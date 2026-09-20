import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-[var(--radius)] border border-[var(--majara-charcoal)]/20 bg-white px-3 text-sm outline-none focus:border-[var(--majara-red)]',
        className,
      )}
      {...props}
    />
  );
}

import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius)] border border-[var(--majara-charcoal)]/16 bg-[var(--majara-sheet)] p-4',
        className,
      )}
      {...props}
    />
  );
}

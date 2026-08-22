import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-none border border-[var(--border)] bg-white p-4 shadow-[0_8px_24px_rgba(20,6,9,.05)]',
        className,
      )}
      {...props}
    />
  );
}

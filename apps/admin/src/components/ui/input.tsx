import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-none border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--majara-red)]',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full rounded-none border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--majara-red)]',
        className,
      )}
      {...props}
    />
  );
}

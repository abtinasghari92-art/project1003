import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center text-sm font-bold transition disabled:opacity-50 rounded-[var(--radius)]',
  {
    variants: {
      variant: {
        default: 'bg-[var(--majara-red)] text-white hover:bg-[var(--majara-red-deep)]',
        outline: 'border border-[var(--majara-ink)] bg-transparent',
        ghost: 'bg-transparent text-[var(--majara-muted)]',
        muted: 'bg-[var(--majara-kraft)] text-[var(--majara-ink)]',
      },
      size: {
        default: 'h-11 px-5',
        lg: 'h-12 px-6 w-full',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: Props) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

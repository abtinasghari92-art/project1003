import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRial(amount: number) {
  return new Intl.NumberFormat('fa-IR-u-nu-latn').format(amount) + ' ریال';
}

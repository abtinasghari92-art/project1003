import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRial(amount: number) {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function apiErrorMessage(body: unknown, fallback: string) {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message.join('، ');
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}

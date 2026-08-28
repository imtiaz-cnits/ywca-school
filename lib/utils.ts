import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined, formatStr = 'dd MMM yyyy'): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, formatStr);
  } catch {
    return '-';
  }
}

export function formatTime(date: Date | string | null | undefined, formatStr = 'hh:mm a'): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, formatStr);
  } catch {
    return '-';
  }
}

export function generateStudentCode(lastNumericId = 1): string {
  const currentYear = new Date().getFullYear();
  const paddedId = String(lastNumericId).padStart(4, '0');
  return `STU-${currentYear}-${paddedId}`;
}

export function generateEmployeeCode(prefix: 'TCH' | 'STF', lastNumericId = 1): string {
  const paddedId = String(lastNumericId).padStart(3, '0');
  return `${prefix}-${paddedId}`;
}

export function convertToBanglaNumber(num: number | string): string {
  const bnDigits: { [key: string]: string } = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };
  return String(num).replace(/[0-9]/g, (w) => bnDigits[w] || w);
}


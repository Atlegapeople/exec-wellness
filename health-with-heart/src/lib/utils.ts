import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate user initials from name
export function getUserInitials(name?: string, surname?: string): string {
  if (name && surname) {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  }
  if (name) {
    return name.charAt(0).toUpperCase();
  }
  return 'U';
}

// Generate user initials from full name string
export function getUserInitialsFromFullName(fullName?: string): string {
  if (!fullName) return 'U';

  const names = fullName.trim().split(' ');
  if (names.length >= 2) {
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  }
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return 'U';
}

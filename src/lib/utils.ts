import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a CSS selector for an element with a specific data-testid
 * @param id - The data-testid value to search for
 * @returns A CSS selector string
 */
export const getByTestId = (id: string): string => {
  return `[data-testid="${id}"]`;
};

/**
 * Finds an element by its data-testid using standard DOM methods
 * @param id - The data-testid value to search for
 * @returns The element with the matching data-testid
 */
export const findByTestId = (id: string) => {
  return document.querySelector(`[data-testid="${id}"]`);
};

/**
 * Finds all elements by their data-testid using standard DOM methods
 * @param id - The data-testid value to search for
 * @returns An array of elements with the matching data-testid
 */
export const findAllByTestId = (id: string) => {
  return document.querySelectorAll(`[data-testid="${id}"]`);
};

/**
 * Converts a string to lowercase and capitalizes the first letter of each word.
 * @param str - The string to format
 * @returns The formatted string
 */
export function toCapitalizedWords(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
} 
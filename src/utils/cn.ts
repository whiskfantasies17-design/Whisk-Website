import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names and handles Tailwind CSS overrides dynamically.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

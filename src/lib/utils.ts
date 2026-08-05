import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  // Remove content inside parentheses/brackets e.g. "Mayank (Project Lead)" -> "Mayank"
  const cleanName = name.replace(/[\(\[\{].*?[\)\]\}]/g, "").trim()
  const words = cleanName
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean)

  if (words.length === 0) return "?"
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}


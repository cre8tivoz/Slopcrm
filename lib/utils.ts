import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getRandomInt(maxInclusive: number): number {
  if (maxInclusive <= 0) return 0;
  const range = maxInclusive + 1;
  const maxValid = Math.floor(0xffffffff / range) * range;
  const array = new Uint32Array(1);

  let randomVal: number;
  do {
    crypto.getRandomValues(array);
    randomVal = array[0];
  } while (randomVal >= maxValid);

  return randomVal % range;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = getRandomInt(i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

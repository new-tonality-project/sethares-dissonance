import Fraction, { type FractionInput } from 'fraction.js';
import type { HarmonicData } from './types';

function round(num: number, places: number = 0): number {
  return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}

/**
 * Convert a frequency ratio to cents.
 * @param ratio - The ratio as FractionInput (number, string, array, object, or Fraction)
 * @param places - Number of decimal places to round to (default: 0, no decimals)
 * @returns The ratio in cents (1200 * log2(ratio)), rounded to the specified number of decimals
 */
export function ratioToCents(ratio: FractionInput, places: number = 0): Fraction {
  const val = new Fraction(ratio).valueOf();
  const num = 1200 * Math.log2(val);
  const rounded = round(num, places);

  return new Fraction(rounded);
}

/**
 * Convert cents to a frequency ratio.
 * @param cents - The interval in cents as FractionInput (number, string, array, object, or Fraction)
 * @param places - Number of decimal places to round to (default: 0, no decimals)
 * @returns The ratio as a Fraction object (2^(cents/1200)), rounded to the specified number of decimals
 */
export function centsToRatio(cents: FractionInput, places: number = 0): Fraction {
  const val = new Fraction(cents).valueOf();
  const num = Math.pow(2, val / 1200);
  const rounded = round(num, places);
  
  return new Fraction(rounded);
}

/**
 * Type guard to check if a value is HarmonicData
 */
export function isHarmonicData(value: unknown): value is HarmonicData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'frequency' in value &&
    'amplitude' in value &&
    'phase' in value
  );
}

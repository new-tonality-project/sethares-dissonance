import Fraction, { type FractionInput } from 'fraction.js';
import { Spectrum } from './Spectrum';

/**
 * Represents a set of frequency ratios (intervals).
 * Uses Map to ensure no duplicate ratios.
 * Useful for building tuning systems, scales, and analyzing interval collections.
 */
export class IntervalSet {
  private ratios: Map<string, Fraction>;

  constructor(ratios?: FractionInput[]) {
    this.ratios = new Map();

    if (!ratios) return

    for (const r of ratios) {
      this.add(r);
    }
  }

  /**
   * Add a ratio to the set.
   * If ratio already exists, it replaces the existing one.
   */
  add(ratio: FractionInput): this {
    const f = new Fraction(ratio);
    this.ratios.set(f.toFraction(), f);
    return this;
  }

  /**
   * Check if the set contains this ratio
   */
  has(ratio: FractionInput): boolean {
    const key = new Fraction(ratio).toFraction();
    return this.ratios.has(key);
  }

  /**
   * Remove a ratio from the set
   * @returns true if ratio was removed, false if it didn't exist
   */
  delete(ratio: FractionInput): this {
    const key = new Fraction(ratio).toFraction();
    this.ratios.delete(key);
    return this;
  }

  /**
   * Get a ratio from the set
   * @returns Fraction object or undefined if not found
   */
  get(ratio: FractionInput): Fraction | undefined {
    const key = new Fraction(ratio).toFraction();
    return this.ratios.get(key);
  }

  /**
   * Number of ratios in the set
   */
  get size(): number {
    return this.ratios.size;
  }

  /**
   * Check if the set is empty
   */
  isEmpty(): boolean {
    return this.ratios.size === 0;
  }

  /**
   * Get all ratios as an array
   */
  getRatios(): Fraction[] {
    return Array.from(this.ratios.values()).sort((a, b) => a.compare(b));
  }

  /**
   * Get the smallest ratio in the set
   */
  min(): Fraction | undefined {
    return this.getRatios().at(0);
  }

  /**
   * Get the largest ratio in the set
   */
  max(): Fraction | undefined {
    return this.getRatios().at(-1);
  }

  /**
   * Clear all ratios from the set
   */
  clear(): this {
    this.ratios.clear();
    return this
  }

  /**
   * Create a copy of this interval set
   */
  clone(): IntervalSet {
    return new IntervalSet(Array.from(this.ratios.values()));
  }

  /**
   * Iterate over all ratios
   */
  forEach(callback: (ratio: Fraction, key: string) => void): void {
    this.ratios.forEach(callback);
  }

  /**
   * Convert to Spectrum with equal amplitudes
   * @param fundamentalHz - Optional fundamental frequency in Hz
   * @param amplitude - Amplitude for all harmonics (default 1)
   */
  toSpectrum(amp: (ratio: Fraction, index: number) => number): Spectrum {
    const spectrum = new Spectrum();

    this.getRatios().forEach((ratio, index) => {
      spectrum.add(ratio, amp(ratio, index));
    });

    return spectrum;
  }

  /**
   * Get ratios as array of strings
   */
  toStrings(): string[] {
    return this.getRatios().map(r => r.toFraction());
  }

  /**
   * Get ratios as array of decimal numbers
   */
  toNumbers(): number[] {
    return this.getRatios().map(r => r.valueOf());
  }

  /**
   * Check if this set equals another set
   */
  equals(other: IntervalSet): boolean {
    if (this.size !== other.size) return false;

    for (const ratio of this.getRatios()) {
      if (!other.has(ratio)) return false;
    }

    return true;
  }

  /**
   * Calculate GCD of all ratios
   */
  private getGCD(): Fraction | undefined {
    const ratios = this.getRatios();

    if (ratios.length === 0) return undefined;

    let gcd = ratios[0]!;
    for (let i = 1; i < ratios.length; i++) {
      gcd = gcd.gcd(ratios[i]!);
    }

    return gcd;
  }

  /**
 * Convert an array of ratios to an array of intervals (differences between consecutive ratios).
 * The first interval is always 1, and each subsequent interval is the current ratio divided by the previous ratio.
 * 
 * @param ratios - Array of Fraction objects representing ratios
 * @returns Array of Fraction objects representing intervals, starting with 1
 * 
 * @example
 * // If ratios are [1, 5/4, 3/2, 2], intervals will be [1, 5/4, 6/5, 4/3]
 * const ratios = [new Fraction(1), new Fraction(5, 4), new Fraction(3, 2), new Fraction(2)];
 * const intervals = getSweepIntervals(ratios);
 */
  toSweepIntervals(): Fraction[] {
    const ratios = this.getRatios();
    const intervals: Fraction[] = [];

    if (ratios.length === 0) return intervals

    intervals.push(new Fraction(1));

    for (let i = 1; i < ratios.length; i++) {
      intervals.push(ratios[i]!.div(ratios[i - 1]!));
    }

    return intervals;
  }

  minMax(min: FractionInput, max: FractionInput): this {
    const minFraction = new Fraction(min);
    const maxFraction = new Fraction(max);

    if (minFraction.compare(maxFraction) > 0) {
      throw new Error('min must be less than or equal to max');
    }

    for (const ratio of this.ratios.values()) {
      if (ratio.compare(minFraction) < 0 || ratio.compare(maxFraction) > 0) {
        this.ratios.delete(ratio.toFraction());
      }
    }

    return this;
  }

  /**
   * Generate all unique ratios between min and max with denominators up to maxDenominator.
   * 
   * This creates all possible fractions n/d where:
   * - min <= n/d <= max
   * - 1 <= d <= maxDenominator
   * - 1 <= n
   * - n and d are coprime (simplified fractions only)
   * 
   * The Map in IntervalSet automatically handles deduplication of equivalent fractions.
   * 
   * @param min - Minimum ratio (inclusive)
   * @param max - Maximum ratio (inclusive)
   * @param maxDenominator - Maximum denominator for generated fractions
   * 
   * @example
   * // All simple ratios in one octave
   * IntervalSetFactory.range(1, 2, 5)
   * // Returns: 1/1, 6/5, 5/4, 4/3, 3/2, 8/5, 5/3, 2/1
   * 
   * @example
   * // Fine divisions for analysis (100 steps per octave)
   * IntervalSetFactory.range(1, 2, 100)
   * 
   * @example
   * // Ratios across 1.5 octaves
   * IntervalSetFactory.range(1, 3, 12)
   */
  static range(
    min: FractionInput,
    max: FractionInput,
    maxDenominator: number
  ): IntervalSet {
    if (maxDenominator < 1) {
      throw new Error('maxDenominator must be at least 1');
    }

    const minFraction = new Fraction(min);
    const maxFraction = new Fraction(max);

    if (minFraction.compare(maxFraction) > 0) {
      throw new Error('min must be less than or equal to max');
    }

    const intervalSet = new IntervalSet();

    for (let denominator = 1; denominator <= maxDenominator; denominator++) {
      const minNumerator = Math.max(1, Math.ceil(minFraction.valueOf() * denominator));
      const maxNumerator = Math.floor(maxFraction.valueOf() * denominator);

      for (let numerator = minNumerator; numerator <= maxNumerator; numerator++) {
        const fraction = new Fraction(numerator, denominator);

        if (fraction.compare(minFraction) >= 0 && fraction.compare(maxFraction) <= 0) {
          intervalSet.add(fraction);
        }
      }
    }

    return intervalSet;
  }

  /**
 * Generate affinitive tuning intervals that contain all ratios between harmonics of two spectra.
 * For each pair of harmonics (one from each spectrum), calculates the ratio between them.
 * Useful for analyzing harmonic relationships and consonance between two sounds.
 * 
 * @param spectrum1 - First spectrum
 * @param spectrum2 - Second spectrum
 * @returns IntervalSet containing all unique ratios between the spectra's harmonics
 */
  static affinitive(context: Spectrum, complement: Spectrum): IntervalSet {
    const intervalSet = new IntervalSet();

    const harmonics1 = context.getHarmonics();
    const harmonics2 = complement.getHarmonics();

    // Calculate ratio between every pair of harmonics
    for (const h1 of harmonics1) {
      for (const h2 of harmonics2) {
        const ratio = h2.frequency.div(h1.frequency);
        intervalSet.add(ratio);
      }
    }

    return intervalSet;
  }

  /**
 * Add intermediate intervals between existing ratios to create a smooth curve.
 * Uses logarithmic spacing to ensure perceptually uniform distribution.
 * A gap of 1→2 gets the same density as 2→4 (both are octaves).
 * 
 * @param maxGapCents - Maximum allowed gap in cents (e.g., 10 for 10-cent steps)
 *                      1200 cents = 1 octave, 100 cents ≈ 1 semitone
 * @returns this (for chaining)
 * 
 * @example
 * const intervals = new IntervalSet([1, 2, 4]);
 * intervals.densify(100); // Max 100-cent (1 semitone) gaps
 * // Adds same number of points between 1→2 as between 2→4
 * 
 * @example
 * // For dissonance curves - logarithmic spacing
 * const extrema = IntervalSet.affinitive(spectrum1, spectrum2);
 * extrema.densify(10); // ~10-cent resolution for smooth curve
 */
  densify(maxGapCents: number): this {
    if (maxGapCents <= 0) {
      throw new Error('maxGapCents must be positive');
    }

    // Convert cents to ratio (1 cent = 2^(1/1200))
    const maxGapRatio = Math.pow(2, maxGapCents / 1200);

    // Keep adding intervals until all gaps are small enough
    let needsMorePoints = true;

    while (needsMorePoints) {
      const sorted = this.getRatios();
      needsMorePoints = false;

      // Check each adjacent pair
      for (let i = 0; i < sorted.length - 1; i++) {
        const left = sorted[i]!;
        const right = sorted[i + 1]!;

        // Calculate logarithmic gap (ratio of ratios)
        const gapRatio = right.div(left).valueOf();

        // If gap is too large, add the geometric mean
        if (gapRatio > maxGapRatio) {
          // Geometric mean: sqrt(a * b) - the logarithmic midpoint
          const geometricMean = Math.sqrt(left.valueOf() * right.valueOf());

          this.add(geometricMean);
          needsMorePoints = true;
        }
      }
    }

    return this;
  }
}

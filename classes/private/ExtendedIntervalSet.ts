import { Fraction, type FractionInput } from "fraction.js";
import { IntervalSet } from "tuning-core";

/**
 * Extended IntervalSet with confine and interpolateLog methods.
 */
export class ExtendedIntervalSet extends IntervalSet {
  /**
   * Fill gaps between consecutive intervals by adding new intervals per gap,
   * equally spaced in logarithmic (ratio) space. Adds at least 3 new intervals per gap.
   * When maxGapCents is provided, subdivides further so each part is ≤ maxGapCents.
   *
   * @param maxGapCents - Optional maximum gap in cents. When set, each subdivision is ≤ this value.
   * @returns this (for chaining)
   */
  interpolateLog(maxGapCents?: number): this {
    const ratios = this.getRatios();
    const toAdd: number[] = [];

    for (let i = 0; i < ratios.length - 1; i++) {
      const left = ratios[i]!;
      const right = ratios[i + 1]!;
      const leftVal = left.valueOf();
      const rightVal = right.valueOf();
      const gapRatio = rightVal / leftVal;

      // Gap in cents: 1200 * log2(right/left)
      const gapCents = 1200 * Math.log2(gapRatio);

      // At least 4 parts (3 new points). If maxGapCents set, use enough parts so each ≤ maxGapCents
      const n =
        maxGapCents != null && maxGapCents > 0
          ? Math.max(4, Math.ceil(gapCents / maxGapCents))
          : 4;

      for (let k = 1; k < n; k++) {
        toAdd.push(leftVal * Math.pow(gapRatio, k / n));
      }
    }

    for (const val of toAdd) {
      this.add(val);
    }

    return this;
  }
}

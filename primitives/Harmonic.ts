import Fraction, { type FractionInput } from 'fraction.js';
import type { HarmonicData } from './types';
import { isHarmonicData } from './utils';

/**
 * Represents a single partial in an arbitrary spectrum.
 * The name Harmonic does not imply a harmonic series but chosen over 
 * Partial to avoid coflict with the TypeScript's Partial type.
 * Mutable for better real-time performance.
 * Frequencies are stored as rational numbers for exact tuning mathematics.
 * 
 * The constructor accepts either a HarmonicData object or individual parameters.
 * 
 * @example
 * // Using HarmonicData object
 * const harmonic1 = new Harmonic({
 *   frequency: 440,
 *   amplitude: 0.5,
 *   phase: Math.PI
 * });
 * 
 * @example
 * // Using individual parameters
 * const harmonic2 = new Harmonic(440, 0.5, Math.PI);
 * const harmonic3 = new Harmonic("440"); // amplitude defaults to 1, phase defaults to 0
 * const harmonic4 = new Harmonic("440 1/3"); // frequency as a string with whole and fractional part
 * const harmonic4 = new Harmonic([107, 100]); // frequency as a fraction of two integers 107/100
 * // Note that frequency is treated as a rational number from Fraction.js lib
 * // so it accepts FractionInput type
 */
export class Harmonic {
  private _frequency: Fraction;  // Frequency as ratio (e.g., 3/2 for perfect fifth)
  private _amplitude: number;    // 0-1 normalized
  private _phase: number;        // 0-2π radians

  /**
   * Get frequency as a Fraction
   */
  get frequency(): Fraction {
    return this._frequency;
  }

  /**
   * Get frequency as a float number
   */
  get frequencyNum(): number {
    return this._frequency.valueOf();
  }

  /**
   * Get frequency as a simplified fraction string (e.g., "3/2")
   */
  get frequencyStr(): string {
    return this._frequency.toFraction();
  }

  /**
   * Get amplitude (0-1 normalized)
   */
  get amplitude(): number {
    return this._amplitude;
  }

  /**
   * Get phase (0-2π radians)
   */
  get phase(): number {
    return this._phase;
  }

  constructor(data: HarmonicData);
  constructor(frequency: FractionInput, amplitude?: number, phase?: number);
  constructor(frequencyOrData: FractionInput | HarmonicData, amplitude = 1, phase = 0) {
    if (isHarmonicData(frequencyOrData)) {
      // HarmonicData case
      this._frequency = new Fraction(frequencyOrData.frequency);
      this._amplitude = frequencyOrData.amplitude;
      this._phase = frequencyOrData.phase;
    } else {
      // Original case: frequency, amplitude, phase
      this._frequency = new Fraction(frequencyOrData);
      this._amplitude = amplitude ?? 1;
      this._phase = phase ?? 0;
    }

    this.validate();
  }

  private validate(): void {
    if (this._frequency.compare(0) <= 0) {
      throw new Error('Frequency must be positive');
    }
    if (this._amplitude < 0 || this._amplitude > 1) {
      throw new Error('Amplitude must be between 0 and 1');
    }
    if (this._phase < 0 || this._phase >= 2 * Math.PI) {
      throw new Error('Phase must be between 0 and 2π');
    }
  }

  /**
   * Sets frequency to the provided value
   */
  setFrequency(frequency: FractionInput): this {
    this._frequency = new Fraction(frequency);
    if (this._frequency.compare(0) <= 0) {
      throw new Error('Frequency must be positive');
    }
    return this;
  }

  /**
   * Sets amplitude (0-1)
   */
  setAmplitude(amplitude: number): this {
    if (amplitude < 0 || amplitude > 1) {
      throw new Error('Amplitude must be between 0 and 1');
    }
    this._amplitude = amplitude;
    return this;
  }

  /**
   * Sets phase (0-2π)
   */
  setPhase(phase: number): this {
    if (phase < 0 || phase >= 2 * Math.PI) {
      throw new Error('Phase must be between 0 and 2π');
    }
    this._phase = phase;
    return this;
  }

  /**
   * Multiply frequency by a ratio (for transposition)
   */
  transpose(ratio: FractionInput): this {
    this._frequency = this._frequency.mul(ratio);
    return this;
  }

  /**
 * Multiply frequency by a ratio (for transposition)
 */
  toTransposed(ratio: FractionInput): Harmonic {
    return this.clone().transpose(ratio);
  }

  /**
   * Scale amplitude by a factor
   */
  scale(factor: number): this {
    this._amplitude = Math.max(0, Math.min(1, this._amplitude * factor));
    return this;
  }

  /**
   * Create a copy of this harmonic
   */
  clone(): Harmonic {
    return new Harmonic(this._frequency, this._amplitude, this._phase);
  }

  /**
   * Compare frequencies (for sorting)
   */
  compareFrequency(other: Harmonic): number {
    return this._frequency.compare(other._frequency);
  }

  /**
   * Serializes the harmonic to a HarmonicData object
   */
  toJSON(): HarmonicData {
    return {
      frequency: {
        n: Number(this._frequency.n),
        d: Number(this._frequency.d),
      },
      amplitude: this._amplitude,
      phase: this._phase,
    };
  }
}

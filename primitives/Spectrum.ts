import Fraction, { type FractionInput } from 'fraction.js';
import { Harmonic } from './Harmonic';
import type { HarmonicData, SpectrumData } from './types';
import { isHarmonicData } from './utils';

/**
 * Represents a spectrum as a collection of harmonics.
 * Uses Map to ensure no duplicate frequencies.
 * Key is the frequency as a string (e.g., "3/2") for exact matching.
 * 
 * @example
 * // Empty spectrum
 * const s1 = new Spectrum();
 * 
 * // Add harmonics using various representations
 * s1.add(new Harmonic(3, 0.5, 0));
 * s1.add(2, 0.3, Math.PI);
 * s1.add({ frequency: '440', amplitude: 0.2, phase: Math.PI / 2 });
 * 
 * @example
 * // From SpectrumData
 * const s2 = new Spectrum([
 *   { frequency: '110', amplitude: 0.5, phase: 0 },
 *   { frequency: '220', amplitude: 0.3, phase: Math.PI } 
 * ]);
 */
export class Spectrum {
  private harmonics: Map<string, Harmonic>;

  constructor(data?: SpectrumData) {
    this.harmonics = new Map();

    if (data) {
      for (const harmonicData of data) {
        const harmonic = new Harmonic(harmonicData);
        this.addHarmonic(harmonic);
      }
    }
  }

  /**
  * Number of harmonics in spectrum
  */
  get size(): number {
    return this.harmonics.size;
  }

  /**
   * Add a harmonic to the spectrum.
   * If harmonic with same frequency exists, replaces it.
   */
  private addHarmonic(harmonic: Harmonic): this {
    const key = harmonic.frequencyStr;
    this.harmonics.set(key, harmonic);

    return this;
  }

  /**
   * Convenience method to add harmonic from various input types
   */
  add(harmonic: Harmonic): this;
  add(data: HarmonicData): this;
  add(frequency: FractionInput, amplitude?: number, phase?: number): this;
  add(harmonicOrDataOrFreq: Harmonic | HarmonicData | FractionInput, amplitude?: number, phase?: number): this {
    if (harmonicOrDataOrFreq instanceof Harmonic) {
      // Harmonic case
      this.addHarmonic(harmonicOrDataOrFreq);
    } else if (isHarmonicData(harmonicOrDataOrFreq)) {
      // HarmonicData case
      const harmonic = new Harmonic(harmonicOrDataOrFreq);
      this.addHarmonic(harmonic);
    } else {
      // FractionInput case: frequency, amplitude, phase
      const harmonic = new Harmonic(harmonicOrDataOrFreq as FractionInput, amplitude ?? 1, phase ?? 0);
      this.addHarmonic(harmonic);
    }

    return this;
  }

  /**
   * Get harmonic by frequency (FractionInput) or Harmonic class
   */
  get(harmonicOrFrequency: Harmonic | FractionInput): Harmonic | undefined {
    if (harmonicOrFrequency instanceof Harmonic) {
      const key = harmonicOrFrequency.frequencyStr;
      return this.harmonics.get(key);
    } else {
      const key = new Fraction(harmonicOrFrequency).toFraction();
      return this.harmonics.get(key);
    }
  }

  /**
   * Check if spectrum contains a harmonic with by frequency (FractionInput) or Harmonic class
   */
  has(harmonicOrFrequency: Harmonic | FractionInput): boolean {
    if (harmonicOrFrequency instanceof Harmonic) {
      const key = harmonicOrFrequency.frequencyStr;
      return this.harmonics.has(key);
    } else {
      const key = new Fraction(harmonicOrFrequency).toFraction();
      return this.harmonics.has(key);
    }
  }

  /**
   * Remove harmonic by frequency (FractionInput) or Harmonic class
   */
  remove(harmonicOrFrequency: Harmonic | FractionInput): this {
    if (harmonicOrFrequency instanceof Harmonic) {
      const key = harmonicOrFrequency.frequencyStr;
      this.harmonics.delete(key);
    } else {
      const key = new Fraction(harmonicOrFrequency).toFraction();
      this.harmonics.delete(key);
    }

    return this;
  }

  /**
   * Get harmonics sorted by frequency (ascending)
   */
  getHarmonics(): Harmonic[] {
    return Array.from(this.harmonics.values()).sort((a, b) => a.compareFrequency(b));
  }

  /**
   * Get all frequencies as an array
   */
  getFrequenciesAsNumbers(): number[] {
    return this.getHarmonics().map(h => h.frequencyNum);
  }

  /**
   * TODO: UNTESTED
   * Get all keys (frequency strings) as an unsorted array.
   * Useful for iterating over harmonics.
   */
  getKeys(): string[] {
    return Array.from(this.harmonics.keys());
  }

  /**
   * Check if spectrum is empty
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Clear all harmonics
   */
  clear(): this {
    this.harmonics.clear();

    return this;
  }

  /**
   * Method to transpose a single harmonic in place
   * Removes the old harmonic and adds the transposed one
   */
  transposeHarmonic(harmonicOrFrequency: Harmonic | FractionInput, ratio: FractionInput): this {
    const oldHarmonic = this.get(harmonicOrFrequency);

    if (!oldHarmonic) return this;

    const oldKey = oldHarmonic.frequencyStr;
    const newHarmonic = oldHarmonic.toTransposed(ratio);
    const newKey = newHarmonic.frequencyStr;

    if (oldKey === newKey) return this;

    this.harmonics.delete(oldKey);
    this.harmonics.set(newKey, newHarmonic);

    return this
  }

  /**
   * Transpose entire spectrum by a ratio in place
   */
  transpose(ratio: FractionInput): this {
    const r = new Fraction(ratio);
    const ratioValue = r.valueOf();

    if (ratioValue === 1) return this;
    if (ratioValue <= 0) throw new Error('Ratio must be greater than 0')

    const allHarmonics = this.getHarmonics();

    // If transposing up, start from highest frequency and go down
    if (ratioValue > 1) {
      for (let i = allHarmonics.length - 1; i >= 0; i--) {
        this.transposeHarmonic(allHarmonics[i]!, r);
      }
      return this;
    }

    for (let i = 0; i < allHarmonics.length; i++) {
      this.transposeHarmonic(allHarmonics[i]!, r);
    }

    return this;
  }

  toTransposed(ratio: FractionInput): Spectrum {
    return this.clone().transpose(ratio);
  }

  /**
   * Scale all amplitudes by a factor
   */
  scaleAmplitudes(factor: number): this {
    for (const harmonic of this.harmonics.values()) {
      harmonic.scale(factor);
    }

    return this
  }

  /**
   * Get the lowest frequency harmonic
   */
  getLowestHarmonic(): Harmonic | undefined {
    const sorted = this.getHarmonics();
    return sorted[0];
  }

  /**
   * Get the highest frequency harmonic
   */
  getHighestHarmonic(): Harmonic | undefined {
    const sorted = this.getHarmonics();
    return sorted[sorted.length - 1];
  }

  /**
   * Calculate GCD of all frequency ratios
   */
  private getGCD(): Fraction | undefined {
    const frequencies = this.getHarmonics().map(h => h.frequency);

    if (frequencies.length === 0) return undefined;

    let gcd = frequencies[0]!;

    for (let i = 1; i < frequencies.length; i++) {
      const freq = frequencies[i];
      if (freq) gcd = gcd.gcd(freq);
    }

    return gcd;
  }

  /**
  * Calculate period of the resulting wave
  */
  getPeriod(): Fraction | undefined {
    const gcd = this.getGCD();

    if (!gcd) return undefined;

    return gcd.inverse();
  }

  /**
   * Create a copy of this spectrum
   */
  clone(): Spectrum {
    const copy = new Spectrum();

    for (const harmonic of this.harmonics.values()) {
      copy.addHarmonic(harmonic.clone());
    }

    return copy;
  }

  /**
   * Iterate over harmonics
   */
  forEach(callback: (harmonic: Harmonic, key: string) => void): void {
    this.harmonics.forEach(callback);
  }

  /**
   * Serialize spectrum to JSON
   */
  toJSON(): SpectrumData {
    const data: SpectrumData = [];

    for (const harmonic of this.harmonics.values()) {
      data.push(harmonic.toJSON());
    }
    
    return data;
  }

  /**
   * Create harmonic spectrum (110 Hz, 220 Hz, 330 Hz, 440 Hz, ...)
   */
  static harmonic(count: number, fundamentalHz: FractionInput): Spectrum {
    const spectrum = new Spectrum();

    for (let i = 1; i <= count; i++) {
      spectrum.add(new Fraction(fundamentalHz).mul(i), 1 / i);
    }

    return spectrum;
  }

  /**
   * Create spectrum from arrays of arbitrary frequencies, amplitudes and phases
   */
  static fromFrequencies(
    frequencies: FractionInput[],
    amplitudes?: number[],
    phases?: number[],
  ): Spectrum {
    const spectrum = new Spectrum();

    frequencies.forEach((frequency, i) => {
      const amp = amplitudes?.[i] ?? 1;
      const phase = phases?.[i] ?? 0;
      spectrum.add(frequency, amp, phase);
    });

    return spectrum;
  }
}

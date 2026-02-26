import type { FractionInput } from "fraction.js";
import { Spectrum, isHarmonicData } from "tuning-core";
import { ExtendedHarmonic, type ExtendedHarmonicData } from "./ExtendedHarmonic";

export type ExtendedSpectrumData = ExtendedHarmonicData[];

export class ExtendedSpectrum extends Spectrum {
  /**
   * Multiply this spectrum by another spectrum.
   * Each harmonic of this spectrum is multiplied by each harmonic of the other
   * (as interval relative to the other's fundamental), and added to the output.
   *
   * Phantom logic:
   * - Result is phantom if either operand harmonic is phantom.
   * - Exception: when multiplying by the fundamental (interval 1), preserve
   *   harmonic_1's phantom status—a real harmonic from "this" is never
   *   overridden by phantom.
   * - When frequencies collide: non-phantom wins (replaces phantom).
   */
  mul(other: ExtendedSpectrum): ExtendedSpectrum {
    const fundamental = other.getLowestHarmonic();
    if (!fundamental) {
      throw new Error(
        "Other spectrum has no fundamental (empty or not computable). Provide spectrum with harmonics."
      );
    }

    const result = new ExtendedSpectrum();

    for (const harmonic_1 of this.getHarmonics()) {
      for (const harmonic_2 of other.getHarmonics()) {
        const interval = harmonic_2.frequency.div(fundamental.frequency);
        const ampRatio = harmonic_2.amplitude / fundamental.amplitude;

        const newFreq = harmonic_1.frequency.mul(interval);
        const newAmp = harmonic_1.amplitude * ampRatio;
        const newPhase = harmonic_2.phase;
        const isFundamental = harmonic_2 === fundamental;
        const newPhantom = isFundamental
          ? harmonic_1.phantom
          : harmonic_1.phantom || harmonic_2.phantom;

        const existing = result.get(newFreq);

        if (existing !== undefined) {
          const existingPhantom = existing.phantom;
          if (existingPhantom && !newPhantom) {
            result.remove(newFreq);
            result.add(newFreq, newAmp, newPhase, newPhantom);
          }
          continue;
        }

        result.add(newFreq, newAmp, newPhase, newPhantom);
      }
    }

    return result;
  }

  constructor(data?: ExtendedSpectrumData | Spectrum) {
    super();
    if (data instanceof Spectrum) {
      for (const harmonic of data.getHarmonics()) {
        this.add(new ExtendedHarmonic({ harmonic, phantom: false }));
      }
    } else if (data) {
      for (const harmonicData of data) {
        this.add(harmonicData);
      }
    }
  }

  override add(harmonic: ExtendedHarmonic): this;
  override add(data: ExtendedHarmonicData): this;
  override add(frequency: FractionInput, amplitude?: number, phase?: number, phantom?: boolean): this;
  override add(
    harmonicOrDataOrFreq: ExtendedHarmonic | ExtendedHarmonicData | FractionInput,
    amplitude?: number,
    phase?: number,
    phantom?: boolean
  ): this {
    if (harmonicOrDataOrFreq instanceof ExtendedHarmonic) {
      super.add(harmonicOrDataOrFreq);
    } else if (isHarmonicData(harmonicOrDataOrFreq)) {
      super.add(new ExtendedHarmonic(harmonicOrDataOrFreq as ExtendedHarmonicData));
    } else {
      super.add(new ExtendedHarmonic(harmonicOrDataOrFreq, amplitude ?? 1, phase ?? 0, phantom ?? false));
    }
    return this;
  }

  override getHarmonics(): ExtendedHarmonic[] {
    return super.getHarmonics() as ExtendedHarmonic[];
  }

  override getLowestHarmonic(): ExtendedHarmonic | undefined {
    return super.getLowestHarmonic() as ExtendedHarmonic | undefined;
  }

  override getHighestHarmonic(): ExtendedHarmonic | undefined {
    return super.getHighestHarmonic() as ExtendedHarmonic | undefined;
  }

  override clone(): ExtendedSpectrum {
    const copy = new ExtendedSpectrum();
    for (const harmonic of this.getHarmonics()) {
      copy.add(harmonic.clone());
    }
    return copy;
  }

  override toTransposed(ratio: FractionInput): ExtendedSpectrum {
    return this.clone().transpose(ratio) as ExtendedSpectrum;
  }

  override toJSON(): ExtendedSpectrumData {
    return this.getHarmonics().map((h) => h.toJSON());
  }

  override get(frequency: FractionInput): ExtendedHarmonic | undefined {
    return super.get(frequency) as ExtendedHarmonic | undefined;
  }
  
  static override harmonic(count: number, fundamentalHz: FractionInput, phantom?: boolean): ExtendedSpectrum {
    const spectrum = super.harmonic(count, fundamentalHz)
    const result = new ExtendedSpectrum();

    for (const harmonic of spectrum.getHarmonics()) {
      result.add(new ExtendedHarmonic({ harmonic, phantom: phantom ?? false }));
    }

    return result;
  }
}

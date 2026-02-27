import type { FractionInput } from "fraction.js";
import { Spectrum, isHarmonicData } from "tuning-core";
import { HarmonicWithLoudness, type HarmonicWithLoudnessData } from "./HarmonicWithLoudness";

export type SpectrumWithLoudnessData = HarmonicWithLoudnessData[];
export class SpectrumWithLoudness extends Spectrum {
  constructor(data?: SpectrumWithLoudnessData | Spectrum) {
    super();
    if (data instanceof Spectrum) {
      for (const harmonic of data.getHarmonics()) {
        this.add(new HarmonicWithLoudness({ harmonic, phantom: false }));
      }
    } else if (data) {
      for (const harmonicData of data) {
        this.add(harmonicData);
      }
    }
  }

  override add(harmonic: HarmonicWithLoudness): this;
  override add(data: HarmonicWithLoudnessData): this;
  override add(frequency: FractionInput, amplitude?: number, phase?: number, phantom?: boolean): this;
  override add(
    harmonicOrDataOrFreq: HarmonicWithLoudness | HarmonicWithLoudnessData | FractionInput,
    amplitude?: number,
    phase?: number,
    phantom?: boolean
  ): this {
    if (harmonicOrDataOrFreq instanceof HarmonicWithLoudness) {
      super.add(harmonicOrDataOrFreq);
    } else if (isHarmonicData(harmonicOrDataOrFreq)) {
      super.add(new HarmonicWithLoudness(harmonicOrDataOrFreq as HarmonicWithLoudnessData));
    } else {
      super.add(new HarmonicWithLoudness(harmonicOrDataOrFreq, amplitude ?? 1, phase ?? 0, phantom ?? false));
    }
    return this;
  }

  override getHarmonics(): HarmonicWithLoudness[] {
    return super.getHarmonics() as HarmonicWithLoudness[];
  }

  override getLowestHarmonic(): HarmonicWithLoudness | undefined {
    return super.getLowestHarmonic() as HarmonicWithLoudness | undefined;
  }

  override getHighestHarmonic(): HarmonicWithLoudness | undefined {
    return super.getHighestHarmonic() as HarmonicWithLoudness | undefined;
  }

  override clone(): SpectrumWithLoudness {
    const copy = new SpectrumWithLoudness();
    for (const harmonic of this.getHarmonics()) {
      copy.add(harmonic.clone());
    }
    return copy;
  }

  override toTransposed(ratio: FractionInput): SpectrumWithLoudness {
    return this.clone().transpose(ratio) as SpectrumWithLoudness;
  }

  override toJSON(): SpectrumWithLoudnessData {
    return this.getHarmonics().map((h) => h.toJSON());
  }

  override get(frequency: FractionInput): HarmonicWithLoudness | undefined {
    return super.get(frequency) as HarmonicWithLoudness | undefined;
  }

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
  mul(other: SpectrumWithLoudness): SpectrumWithLoudness {
    const fundamental = other.getLowestHarmonic();
    if (!fundamental) {
      throw new Error(
        "Other spectrum has no fundamental (empty or not computable). Provide spectrum with harmonics."
      );
    }

    const result = new SpectrumWithLoudness();

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

  static override harmonic(count: number, fundamentalHz: FractionInput, phantom?: boolean): SpectrumWithLoudness {
    const spectrum = super.harmonic(count, fundamentalHz)
    const result = new SpectrumWithLoudness();

    for (const harmonic of spectrum.getHarmonics()) {
      result.add(new HarmonicWithLoudness({ harmonic, phantom: phantom ?? false }));
    }

    return result;
  }
}

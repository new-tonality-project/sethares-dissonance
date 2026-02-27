import type { FractionInput } from "fraction.js";
import { Harmonic, isHarmonicData } from "tuning-core";
import type { HarmonicData } from "tuning-core";
import { getLoudness } from "../../lib/loudness";

type HarmonicWithLoudnessOptions = {
  harmonic: Harmonic;
  phantom: boolean;
};

export type HarmonicWithLoudnessData = HarmonicData & { phantom?: boolean };

export class HarmonicWithLoudness extends Harmonic {
  public phantom: boolean = false;
  public loudness: number;

  constructor(options: HarmonicWithLoudnessOptions);
  constructor(data: HarmonicWithLoudnessData);
  constructor(frequency: FractionInput, amplitude?: number, phase?: number, phantom?: boolean);
  constructor(
    optionsOrDataOrFreq: HarmonicWithLoudnessOptions | HarmonicWithLoudnessData | FractionInput,
    amplitudeOrPhantom?: number,
    phase?: number,
    phantom?: boolean
  ) {
    if (
      typeof optionsOrDataOrFreq === "object" &&
      "harmonic" in optionsOrDataOrFreq &&
      optionsOrDataOrFreq.harmonic instanceof Harmonic
    ) {
      const opts = optionsOrDataOrFreq as HarmonicWithLoudnessOptions;
      super(opts.harmonic.frequency, opts.harmonic.amplitude, opts.harmonic.phase);
      this.phantom = opts.phantom;
      this.loudness = getLoudness(opts.harmonic.amplitude);
    } else if (isHarmonicData(optionsOrDataOrFreq)) {
      const data = optionsOrDataOrFreq as HarmonicWithLoudnessData;
      super(data);
      this.phantom = data.phantom ?? false;
      this.loudness = getLoudness(data.amplitude ?? 1);
    } else {
      super(optionsOrDataOrFreq as FractionInput, amplitudeOrPhantom ?? 1, phase ?? 0);
      this.phantom = phantom ?? false;
      this.loudness = getLoudness(amplitudeOrPhantom ?? 1);
    }
  }

  override clone(): HarmonicWithLoudness {
    return new HarmonicWithLoudness({
      harmonic: new Harmonic(this.frequency, this.amplitude, this.phase),
      phantom: this.phantom,
    });
  }

  override toTransposed(ratio: FractionInput): HarmonicWithLoudness {
    return new HarmonicWithLoudness({
      harmonic: super.toTransposed(ratio),
      phantom: this.phantom,
    });
  }

  override toJSON(): HarmonicWithLoudnessData {
    return { ...super.toJSON(), phantom: this.phantom };
  }
}

import type { FractionInput } from "fraction.js";
import { Harmonic, isHarmonicData } from "tuning-core";
import type { HarmonicData } from "tuning-core";

type ExtendedHarmonicOptions = {
  harmonic: Harmonic;
  phantom: boolean;
};

export type ExtendedHarmonicData = HarmonicData & { phantom?: boolean };

export class ExtendedHarmonic extends Harmonic {
  public phantom: boolean = false;

  constructor(options: ExtendedHarmonicOptions);
  constructor(data: ExtendedHarmonicData);
  constructor(frequency: FractionInput, amplitude?: number, phase?: number, phantom?: boolean);
  constructor(
    optionsOrDataOrFreq: ExtendedHarmonicOptions | ExtendedHarmonicData | FractionInput,
    amplitudeOrPhantom?: number,
    phase?: number,
    phantom?: boolean
  ) {
    if (
      typeof optionsOrDataOrFreq === "object" &&
      "harmonic" in optionsOrDataOrFreq &&
      optionsOrDataOrFreq.harmonic instanceof Harmonic
    ) {
      const opts = optionsOrDataOrFreq as ExtendedHarmonicOptions;
      super(opts.harmonic.frequency, opts.harmonic.amplitude, opts.harmonic.phase);
      this.phantom = opts.phantom;
    } else if (isHarmonicData(optionsOrDataOrFreq)) {
      const data = optionsOrDataOrFreq as ExtendedHarmonicData;
      super(data);
      this.phantom = data.phantom ?? false;
    } else {
      super(optionsOrDataOrFreq as FractionInput, amplitudeOrPhantom ?? 1, phase ?? 0);
      this.phantom = phantom ?? false;
    }
  }

  override clone(): ExtendedHarmonic {
    return new ExtendedHarmonic({
      harmonic: new Harmonic(this.frequency, this.amplitude, this.phase),
      phantom: this.phantom,
    });
  }

  override toTransposed(ratio: FractionInput): ExtendedHarmonic {
    return new ExtendedHarmonic({
      harmonic: super.toTransposed(ratio),
      phantom: this.phantom,
    });
  }

  override toJSON(): ExtendedHarmonicData {
    return { ...super.toJSON(), phantom: this.phantom };
  }
}

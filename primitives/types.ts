/**
 * Plain object for serialization/deserialization
 */
export type HarmonicData = {
  frequency: {
    n: number;
    d: number;
  };
  amplitude: number;
  phase: number;
}

export type SpectrumData = HarmonicData[]

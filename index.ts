import { DissonanceCurve } from "./classes";
import { Spectrum } from "./primitives";

export * from "./classes"
export * from "./lib"

const context = Spectrum.harmonic(6, 440);
const complement = Spectrum.harmonic(6, 440);

const test = new DissonanceCurve({
  context,
  complement,
  start: 1,
  end: 2,
  maxDenominator: 60,
});

const buffer = test.toCsvFileBuffer();
Bun.write("test.csv", buffer);

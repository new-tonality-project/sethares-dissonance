export type Spectrum = {
  freq: number;
  loudness: number;
}[];

/** The formula to calculate loudness from amplitude proposed by Sethares in the appendix "How to Draw Dissonance Curves" */
export function getSetharesLoudness(amplitude: number): number {
  const P_e = amplitude / Math.SQRT2;
  const P_ref = 20;

  const SPL = 20 * Math.log10(P_e / P_ref);

  return 2 ** (SPL / 10) / 16;
}

/** Fitting parameters proposed by Sethares in the appendix "How to Draw Dissonance Curves" */
export const SETHARES_DISSONANCE_PARAMS = {
  s1: 0.021,
  s2: 19,
  b1: 3.5,
  b2: 5.75,
  x_star: 0.24,
};

/** The formula to calculate sensory dissoannce proposed by Sethares in the appendix "How to Draw Dissonance Curves" */
export function getPlompLeveltDissonance(
  freq1: number,
  freq2: number,
  loudness1: number,
  loudness2: number,
  params = SETHARES_DISSONANCE_PARAMS
): number {
  if (freq1 === freq2) return 0;

  const minLoudness = Math.min(loudness1, loudness2);
  if (minLoudness <= 0) return 0;

  const minFrequency = Math.min(freq1, freq2);
  const frequencyDifference = Math.abs(freq1 - freq2);

  if (minFrequency <= 0) return 0;

  const s = params.x_star / (params.s1 * minFrequency + params.s2);

  return (
    minLoudness *
    (Math.exp(-1 * params.b1 * s * frequencyDifference) -
      Math.exp(-1 * params.b2 * s * frequencyDifference))
  );
}

export function getIntrinsicDissonance(
  spectrum: Spectrum,
  params = SETHARES_DISSONANCE_PARAMS
) {
  let dissonance = 0;

  for (let i = 0; i < spectrum.length; i++) {
    for (let j = i + 1; j < spectrum.length; j++) {
      const partial1 = spectrum[i]!;
      const partial2 = spectrum[j]!;

      dissonance += getPlompLeveltDissonance(
        partial1.freq,
        partial2.freq,
        partial1.loudness,
        partial2.loudness,
        params
      );
    }
  }

  return dissonance;
}

export function getSetharesDissonance(
  spectrum1: Spectrum,
  spectrum2: Spectrum,
  params = SETHARES_DISSONANCE_PARAMS
) {
  let dissonance =
    getIntrinsicDissonance(spectrum1, params) +
    getIntrinsicDissonance(spectrum2, params);

  for (let i = 0; i < spectrum1.length; i++) {
    for (let j = i + 1; j < spectrum2.length; j++) {
      const partial1 = spectrum1[i]!;
      const partial2 = spectrum2[j]!;

      dissonance += getPlompLeveltDissonance(
        partial1.freq,
        partial2.freq,
        partial1.loudness,
        partial2.loudness,
        params
      );
    }
  }

  return dissonance;
}

export function ratioToCents(ratio: number): number {
  return ratio > 0 ? 1200 * Math.log2(ratio) : 0;
}

export function centsToRatio(cents: number): number {
  return 2 ** (cents / 1200);
}

export function transpose(spectrum: Spectrum, cents: number) {
  const result: Spectrum = [];

  for (const partial of spectrum) {
    result.push({
      freq: partial.freq * centsToRatio(cents),
      loudness: partial.loudness,
    });
  }

  return result;
}

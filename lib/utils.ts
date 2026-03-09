import type { Harmonic } from "tuning-core";
import {
    DEFAULT_FIRST_ORDER_DISSONANCE_PARAMS,
    DEFAULT_SECOND_ORDER_DISSONANCE_PARAMS,
    DEFAULT_THIRD_ORDER_DISSONANCE_PARAMS,
    SETHARES_DISSONANCE_PARAMS,
} from "./const";
import { getLoudness } from "./loudness";
import type { DissonanceParams, SetharesDissonanceParams } from "./types";
import type { HarmonicWithLoudness } from "../classes/private/HarmonicWithLoudness";
import { SpectrumWithLoudness } from "../classes/private/SpectrumWithLoudness";

export { getLoudness } from "./loudness";

/** The formula to calculate sensory dissoannce proposed by Sethares in the appendix "How to Draw Dissonance Curves" */
export function getPlompLeveltDissonance(
    h1: Harmonic,
    h2: Harmonic,
    params: SetharesDissonanceParams
): number {
    const magnitude = params?.magnitude ?? SETHARES_DISSONANCE_PARAMS.magnitude;

    if (magnitude <= 0) return 0;

    const x_star = params?.x_star ?? SETHARES_DISSONANCE_PARAMS.x_star;
    const s1 = params?.s1 ?? SETHARES_DISSONANCE_PARAMS.s1;
    const s2 = params?.s2 ?? SETHARES_DISSONANCE_PARAMS.s2;
    const b1 = params?.b1 ?? SETHARES_DISSONANCE_PARAMS.b1;
    const b2 = params?.b2 ?? SETHARES_DISSONANCE_PARAMS.b2;

    if (h1.frequency.equals(h2.frequency)) return 0;

    const minLoudness = Math.min(
        "loudness" in h1 ? (h1 as HarmonicWithLoudness).loudness : getLoudness(h1.amplitude),
        "loudness" in h2 ? (h2 as HarmonicWithLoudness).loudness : getLoudness(h2.amplitude)
    );
    if (minLoudness <= 0) return 0;

    const minFrequency = Math.min(h1.frequencyNum, h2.frequencyNum);

    if (minFrequency <= 0) return 0;

    const frequencyDifference = Math.abs(h1.frequencyNum - h2.frequencyNum);
    const s = x_star / (s1 * minFrequency + s2);

    return (
        magnitude *
        minLoudness *
        (Math.exp(-1 * b1 * s * frequencyDifference) -
            Math.exp(-1 * b2 * s * frequencyDifference))
    );
}

/**
 * Find dissonance between two harmonics based on phantom status.
 * - Both non-phantom: first order
 * - One phantom, one non-phantom: second order
 * - Both phantom: third order
 */
export function getSensoryDissonance(
    h1: HarmonicWithLoudness,
    h2: HarmonicWithLoudness,
    params?: DissonanceParams
): number {
    if (!h1.phantom && !h2.phantom) {
        return getPlompLeveltDissonance(h1, h2, {
            ...DEFAULT_FIRST_ORDER_DISSONANCE_PARAMS,
            ...params?.firstOrderDissonance,
        });
    }
    if (h1.phantom !== h2.phantom) {
        return getPlompLeveltDissonance(h1, h2, {
            ...DEFAULT_SECOND_ORDER_DISSONANCE_PARAMS,
            ...params?.secondOrderDissonance,
        });
    }
    return getPlompLeveltDissonance(h1, h2, {
        ...DEFAULT_THIRD_ORDER_DISSONANCE_PARAMS,
        ...params?.thirdOrderDissonance,
    });
}

/**
 * Calculate the intrinsic dissonance of a spectrum.
 */
export function getIntrinsicDissonance(
    spectrum: SpectrumWithLoudness,
    params?: DissonanceParams
) {
    let dissonance = 0;

    const harmonics = spectrum.getHarmonics();

    // loop over all pairs of harmonics within the spectrum (not including reversed pairs)
    for (let i = 0; i < harmonics.length; i++) {
        for (let j = i + 1; j < harmonics.length; j++) {
            const h1 = harmonics[i]!;
            const h2 = harmonics[j]!;

            dissonance += getSensoryDissonance(h1, h2, params);
        }
    }

    return dissonance;
}

/**
 * Calculate the dissonance between two spectra.
 * This is the sum of the intrinsic dissonance of each spectrum 
 * plus the dissonance between the harmonics of the two spectra.
 * 
 * Note: If not proviing secondOrderBeating params is yield the same result as Sethares' TTSS formula.
 * However secondOrderBeating params can be used to finetune the dissoannce perception and account for harmonicity.
 *
 * @param precomputedSpectrum1Intrinsic - When provided, use this instead of computing spectrum1's intrinsic dissonance (for performance when spectrum1 is constant across many calls).
 */
export function getSetharesDissonance(
    spectrum1: SpectrumWithLoudness,
    spectrum2: SpectrumWithLoudness,
    params?: DissonanceParams,
    precomputedSpectrum1Intrinsic?: number
) {
    const spectrum1Intrinsic = precomputedSpectrum1Intrinsic ?? getIntrinsicDissonance(spectrum1, params);
    let dissonance = spectrum1Intrinsic + getIntrinsicDissonance(spectrum2, params);

    // loop over all pairs of harmonics between the two spectra (not including reversed pairs)
    for (const h1 of spectrum1.getHarmonics()) {
        for (const h2 of spectrum2.getHarmonics()) {
            dissonance += getSensoryDissonance(h1, h2, params);
        }
    }

    return dissonance;
}

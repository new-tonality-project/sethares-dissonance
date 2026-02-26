import type { Harmonic } from "tuning-core";
import { NORMALISATION_PRESSURE_UNIT, SETHARES_DISSONANCE_PARAMS } from "./const";
import type { DissonanceParams, SetharesDissonanceParams } from "./types";
import type { ExtendedHarmonic } from "../classes/private/ExtendedHarmonic";
import { ExtendedSpectrum } from "../classes/private/ExtendedSpectrum";


/**
 * The formula to calculate loudness from amplitude. The converstion to SPL (phons) is done according to Sethares in the appendix "How to Draw Dissonance Curves". The converstion to loudness is done according to https://sengpielaudio.com/calculatorSonephon.htm
 * @param {number} amplitude - the normalized peak value where 0.001 corresponds to SPL of 40 db or 1 sone and 1 to SPL of 100db and 64 sones. Normalisation is done for the simplicity of providing harmonic spectrum with amplitudes 1, 1/2, 1/3, ...
 */
export function getLoudness(amplitude: number): number {
    const rms = amplitude / Math.SQRT2;
    const pressure = rms * NORMALISATION_PRESSURE_UNIT;
    const referencePressure = 2e-5;

    const phons = 20 * Math.log10(pressure / referencePressure);

    if (phons < 8) return 0;
    if (phons < 40) return Math.pow(phons / 40, 2.86) - 0.005;
    return Math.pow(2, (phons - 40) / 10);
}

/** The formula to calculate sensory dissoannce proposed by Sethares in the appendix "How to Draw Dissonance Curves" */
export function getPlompLeveltDissonance(
    h1: Harmonic,
    h2: Harmonic,
    params?: SetharesDissonanceParams & {
        contribution?: number;
    }
): number {
    const contribution = params?.contribution ?? 1;

    if (contribution <= 0) return 0;

    const x_star = params?.x_star ?? SETHARES_DISSONANCE_PARAMS.x_star;
    const s1 = params?.s1 ?? SETHARES_DISSONANCE_PARAMS.s1;
    const s2 = params?.s2 ?? SETHARES_DISSONANCE_PARAMS.s2;
    const b1 = params?.b1 ?? SETHARES_DISSONANCE_PARAMS.b1;
    const b2 = params?.b2 ?? SETHARES_DISSONANCE_PARAMS.b2;

    if (h1.frequency.equals(h2.frequency)) return 0;

    const minLoudness = Math.min(
        getLoudness(h1.amplitude),
        getLoudness(h2.amplitude)
    );
    if (minLoudness <= 0) return 0;

    const minFrequency = Math.min(h1.frequencyNum, h2.frequencyNum);

    if (minFrequency <= 0) return 0;

    const frequencyDifference = Math.abs(h1.frequencyNum - h2.frequencyNum);
    const s = x_star / (s1 * minFrequency + s2);

    return (
        contribution *
        minLoudness *
        (Math.exp(-1 * b1 * s * frequencyDifference) -
            Math.exp(-1 * b2 * s * frequencyDifference))
    );
}

/** For now identical to getPlompLeveltDissonance */
function firstOrderDissonance(
    h1: Harmonic,
    h2: Harmonic,
    params?: DissonanceParams
): number {
    return getPlompLeveltDissonance(h1, h2, { ...params, contribution: params?.firstOrderContribution });
}

/** For now identical to getPlompLeveltDissonance */
function secondOrderDissonance(
    h1: Harmonic,
    h2: Harmonic,
    params?: DissonanceParams
): number {
    return getPlompLeveltDissonance(h1, h2, { ...params, contribution: params?.secondOrderContribution });
}

/** For now identical to getPlompLeveltDissonance */
function thirdOrderDissonance(
    h1: Harmonic,
    h2: Harmonic,
    params?: DissonanceParams
): number {
    return getPlompLeveltDissonance(h1, h2, { ...params, contribution: params?.thirdOrderContribution });
}

/**
 * Find dissonance between two harmonics based on phantom status.
 * - Both non-phantom: firstOrderDissonance
 * - One phantom, one non-phantom: secondOrderDissonance
 * - Both phantom: thirdOrderDissonance
 */
export function getSensoryDissonance(
    h1: ExtendedHarmonic,
    h2: ExtendedHarmonic,
    params?: DissonanceParams
): number {
    if (!h1.phantom && !h2.phantom) {
        return firstOrderDissonance(h1, h2, params);
    }
    if (h1.phantom !== h2.phantom) {
        return secondOrderDissonance(h1, h2, params);
    }
    return thirdOrderDissonance(h1, h2, params);
}

/**
 * Calculate the intrinsic dissonance of a spectrum.
 */
export function getIntrinsicDissonance(
    spectrum: ExtendedSpectrum,
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
 */
export function getSetharesDissonance(
    spectrum1: ExtendedSpectrum,
    spectrum2: ExtendedSpectrum,
    params?: DissonanceParams
) {
    let dissonance = getIntrinsicDissonance(spectrum1, params) + getIntrinsicDissonance(spectrum2, params);

    // loop over all pairs of harmonics between the two spectra (not including reversed pairs)
    for (const h1 of spectrum1.getHarmonics()) {
        for (const h2 of spectrum2.getHarmonics()) {
            dissonance += getSensoryDissonance(h1, h2, params);
        }
    }

    return dissonance;
}

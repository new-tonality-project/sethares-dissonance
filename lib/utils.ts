import type { Harmonic, Spectrum } from "../primitives";
import { DEFAULT_DISSONANCE_PARAMS, NORMALISATION_PRESSURE_UNIT } from "./const";
import type { DissonanceParams } from "./types";


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
    params?: DissonanceParams
): number {
    const x_star = params?.x_star ?? DEFAULT_DISSONANCE_PARAMS.x_star;
    const s1 = params?.s1 ?? DEFAULT_DISSONANCE_PARAMS.s1;
    const s2 = params?.s2 ?? DEFAULT_DISSONANCE_PARAMS.s2;
    const b1 = params?.b1 ?? DEFAULT_DISSONANCE_PARAMS.b1;
    const b2 = params?.b2 ?? DEFAULT_DISSONANCE_PARAMS.b2;
    
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
        minLoudness *
        (Math.exp(-1 * b1 * s * frequencyDifference) -
            Math.exp(-1 * b2 * s * frequencyDifference))
    );
}

/**
 * Calculate the intrinsic dissonance of a spectrum.
 */
export function getIntrinsicDissonance(
    spectrum: Spectrum,
    params?: DissonanceParams
) {
    const totalContribution =
        params?.totalContribution ??
        DEFAULT_DISSONANCE_PARAMS.totalContribution;
    const secondOrderBeatingContribution =
        params?.secondOrderBeating?.totalContribution ??
        DEFAULT_DISSONANCE_PARAMS.secondOrderBeating?.totalContribution;

    let dissonance = 0;

    const frequencies = spectrum.getKeys();

    // loop over all pairs of harmonics within the spectrum (not including reversed pairs)
    for (let i = 0; i < frequencies.length; i++) {
        for (let j = i + 1; j < frequencies.length; j++) {
            const h1 = spectrum.get(frequencies[i]!)!;
            const h2 = spectrum.get(frequencies[j]!)!;

            if (totalContribution) {
                dissonance +=
                    totalContribution *
                    getPlompLeveltDissonance(h1, h2, params);
            }

            if (secondOrderBeatingContribution) {
                dissonance +=
                    secondOrderBeatingContribution *
                    getSecondOrderBeatingDissonance(h1, h2, params);
            }
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
    spectrum1: Spectrum,
    spectrum2: Spectrum,
    params?: DissonanceParams
) {
    const totalContribution =
        params?.totalContribution ??
        DEFAULT_DISSONANCE_PARAMS.totalContribution;
    const secondOrderBeatingContribution =
        params?.secondOrderBeating?.totalContribution ??
        DEFAULT_DISSONANCE_PARAMS.secondOrderBeating?.totalContribution;

    let dissonance =
        getIntrinsicDissonance(spectrum1, params) +
        getIntrinsicDissonance(spectrum2, params);

    const frequencies1 = spectrum1.getKeys();
    const frequencies2 = spectrum2.getKeys();

    // loop over all pairs of harmonics between the two spectra (not including reversed pairs)
    for (let i = 0; i < frequencies1.length; i++) {
        for (let j = 0; j < frequencies2.length; j++) {
            const h1 = spectrum1.get(frequencies1[i]!)!;
            const h2 = spectrum2.get(frequencies2[j]!)!;

            if (totalContribution) {
                dissonance +=
                    totalContribution *
                    getPlompLeveltDissonance(h1, h2, params);
            }
            if (secondOrderBeatingContribution) {
                dissonance +=
                    secondOrderBeatingContribution *
                    getSecondOrderBeatingDissonance(h1, h2, params);
            }
        }
    }

    return dissonance;
}

/**
 * Helper function to calculate the second order beating dissonance between two harmonics.
 */
export function getSecondOrderBeatingDissonance(
    h1: Harmonic,
    h2: Harmonic,
    params?: DissonanceParams
): number {
    const x_star = params?.x_star ?? DEFAULT_DISSONANCE_PARAMS.x_star;
    const s1 = params?.s1 ?? DEFAULT_DISSONANCE_PARAMS.s1;
    const s2 = params?.s2 ?? DEFAULT_DISSONANCE_PARAMS.s2;
    const b1 = params?.b1 ?? DEFAULT_DISSONANCE_PARAMS.b1;
    const b2 = params?.b2 ?? DEFAULT_DISSONANCE_PARAMS.b2;
    const widthMagnitudeRelationship =
        params?.secondOrderBeating?.widthMagnitudeRelationship ??
        DEFAULT_DISSONANCE_PARAMS.secondOrderBeating.widthMagnitudeRelationship;
    const terms =
        params?.secondOrderBeating?.terms ??
        DEFAULT_DISSONANCE_PARAMS.secondOrderBeating.terms;

    let dissonance = 0;

    const minLoudness = Math.min(
        getLoudness(h1.amplitude),
        getLoudness(h2.amplitude)
    );

    const minFrequency = Math.min(h1.frequencyNum, h2.frequencyNum);
    if (minFrequency <= 0) return 0;

    const maxFrequency = Math.max(h1.frequencyNum, h2.frequencyNum);

    for (const term of terms) {
        if (term.ratio === 1 || term.ratio <= 0) continue;

        const difference = Math.abs(minFrequency * term.ratio - maxFrequency);

        const s = x_star / (s1 * minFrequency + s2);
        const widthModifier = 1 - widthMagnitudeRelationship * term.magnitude;

        dissonance +=
            term.magnitude *
            minLoudness *
            (Math.exp((-1 * b1 * s * difference) / widthModifier) -
                Math.exp((-1 * b2 * s * difference) / widthModifier));
    }

    return dissonance;
}

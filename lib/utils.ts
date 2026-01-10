export type SpectrumPartial = {
    frequency: number;
    amplitude: number;
    phase?: number;
};

const NORMALISATION_PRESSURE_UNIT = 2.8284271247461905;

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

type SecondOrderBeatingTerm = {
    ratio: number;
    magnitude: number;
};

/** Fitting parameters proposed by Sethares in the appendix "How to Draw Dissonance Curves" */
export const SETHARES_DISSONANCE_PARAMS = {
    s1: 0.021,
    s2: 19,
    b1: 3.5,
    b2: 5.75,
    x_star: 0.24,
    totalContribution: 1,
};
export type SetharesDissonanceParams = Partial<
    typeof SETHARES_DISSONANCE_PARAMS
>;

export const SECOND_ORDER_BEATING_PARAMS = {
    terms: [] as SecondOrderBeatingTerm[],
    widthMagnitudeRelationship: 0,
    totalContribution: 1,
};
export type SecondOrderBeatingParams = Partial<
    typeof SECOND_ORDER_BEATING_PARAMS
>;

export type DissonanceParams = SetharesDissonanceParams & {
    secondOrderBeating?: SecondOrderBeatingParams;
};

export const DEFAULT_DISSONANCE_PARAMS = {
    ...SETHARES_DISSONANCE_PARAMS,
    secondOrderBeating: SECOND_ORDER_BEATING_PARAMS,
};

/** The formula to calculate sensory dissoannce proposed by Sethares in the appendix "How to Draw Dissonance Curves" */
export function getPlompLeveltDissonance(
    partial1: SpectrumPartial,
    partial2: SpectrumPartial,
    params?: DissonanceParams
): number {
    const x_star = params?.x_star ?? DEFAULT_DISSONANCE_PARAMS.x_star;
    const s1 = params?.s1 ?? DEFAULT_DISSONANCE_PARAMS.s1;
    const s2 = params?.s2 ?? DEFAULT_DISSONANCE_PARAMS.s2;
    const b1 = params?.b1 ?? DEFAULT_DISSONANCE_PARAMS.b1;
    const b2 = params?.b2 ?? DEFAULT_DISSONANCE_PARAMS.b2;

    if (partial1.frequency === partial2.frequency) return 0;

    const minLoudness = Math.min(
        getLoudness(partial1.amplitude),
        getLoudness(partial2.amplitude)
    );
    if (minLoudness <= 0) return 0;

    const minFrequency = Math.min(partial1.frequency, partial2.frequency);
    if (minFrequency <= 0) return 0;

    const frequencyDifference = Math.abs(
        partial1.frequency - partial2.frequency
    );

    const s = x_star / (s1 * minFrequency + s2);

    return (
        minLoudness *
        (Math.exp(-1 * b1 * s * frequencyDifference) -
            Math.exp(-1 * b2 * s * frequencyDifference))
    );
}

export function getSecondOrderBeatingDissonance(
    partial1: SpectrumPartial,
    partial2: SpectrumPartial,
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
        getLoudness(partial1.amplitude),
        getLoudness(partial2.amplitude)
    );
    if (minLoudness <= 0) return 0;

    const minFrequency = Math.min(partial1.frequency, partial2.frequency);
    if (minFrequency <= 0) return 0;

    const maxFrequency = Math.max(partial1.frequency, partial2.frequency);

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

export function getIntrinsicDissonance(
    spectrum: SpectrumPartial[],
    params?: DissonanceParams
) {
    const totalContribution =
        params?.totalContribution ??
        DEFAULT_DISSONANCE_PARAMS.totalContribution;
    const secondOrderBeatingContribution =
        params?.secondOrderBeating?.totalContribution ??
        DEFAULT_DISSONANCE_PARAMS.secondOrderBeating?.totalContribution;

    let dissonance = 0;

    for (let i = 0; i < spectrum.length; i++) {
        for (let j = i + 1; j < spectrum.length; j++) {
            const partial1 = spectrum[i]!;
            const partial2 = spectrum[j]!;

            if (totalContribution) {
                dissonance +=
                    totalContribution *
                    getPlompLeveltDissonance(partial1, partial2, params);
            }

            if (secondOrderBeatingContribution) {
                dissonance +=
                    secondOrderBeatingContribution *
                    getSecondOrderBeatingDissonance(partial1, partial2, params);
            }
        }
    }

    return dissonance;
}

export function getSetharesDissonance(
    spectrum1: SpectrumPartial[],
    spectrum2: SpectrumPartial[],
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

    for (let i = 0; i < spectrum1.length; i++) {
        for (let j = 0; j < spectrum2.length; j++) {
            const partial1 = spectrum1[i]!;
            const partial2 = spectrum2[j]!;

            if (totalContribution) {
                dissonance +=
                    totalContribution *
                    getPlompLeveltDissonance(partial1, partial2, params);
            }
            if (secondOrderBeatingContribution) {
                dissonance +=
                    secondOrderBeatingContribution *
                    getSecondOrderBeatingDissonance(partial1, partial2, params);
            }
        }
    }

    return dissonance;
}

export function ratioToCents(ratio: number): number {
    return ratio > 0 ? 1200 * Math.log2(ratio) : 0;
}

export function centsToRatio(cents: number): number {
    return Math.pow(2, cents / 1200);
}

export function transpose(partials: SpectrumPartial[], cents: number) {
    const result: SpectrumPartial[] = [];

    for (const partial of partials) {
        result.push({
            frequency: partial.frequency * centsToRatio(cents),
            amplitude: partial.amplitude,
        });
    }

    return result;
}

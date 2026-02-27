import { NORMALISATION_PRESSURE_UNIT } from "./const";

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

export const NORMALISATION_PRESSURE_UNIT = 2.8284271247461905;

/** Fitting parameters proposed by Sethares in the appendix "How to Draw Dissonance Curves" */
export const SETHARES_DISSONANCE_PARAMS = {
  s1: 0.021,
  s2: 19,
  b1: 3.5,
  b2: 5.75,
  x_star: 0.24,
  magnitude: 1,
} as const;

export const DEFAULT_FIRST_ORDER_DISSONANCE_PARAMS = { ...SETHARES_DISSONANCE_PARAMS };
export const DEFAULT_SECOND_ORDER_DISSONANCE_PARAMS = { ...SETHARES_DISSONANCE_PARAMS, magnitude: 0.25 };
export const DEFAULT_THIRD_ORDER_DISSONANCE_PARAMS = { ...SETHARES_DISSONANCE_PARAMS, magnitude: 0.1 };

export const DEFAULT_PHANTOM_HARMONICS_NUMBER = 0;

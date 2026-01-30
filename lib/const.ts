import type { SecondOrderBeatingTerm } from "./types";

export const NORMALISATION_PRESSURE_UNIT = 2.8284271247461905;

export const SECOND_ORDER_BEATING_PARAMS = {
  terms: [] as SecondOrderBeatingTerm[],
  widthMagnitudeRelationship: 0,
  totalContribution: 1,
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

export const DEFAULT_DISSONANCE_PARAMS = {
  ...SETHARES_DISSONANCE_PARAMS,
  secondOrderBeating: SECOND_ORDER_BEATING_PARAMS,
};

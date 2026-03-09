import type Fraction from "fraction.js";
import type { SETHARES_DISSONANCE_PARAMS } from "./const";

/** Params for Plomp-Levelt formula; all numeric to allow overrides */
export type SetharesDissonanceParams = Partial<{
    [K in keyof typeof SETHARES_DISSONANCE_PARAMS]: number;
}>;

export type DissonanceParams = {
  firstOrderDissonance?: SetharesDissonanceParams;
  secondOrderDissonance?: SetharesDissonanceParams;
  thirdOrderDissonance?: SetharesDissonanceParams;
  phantomHarmonicsNumber?: number;
};

export type DissonanceCurvePoint = {
  interval: Fraction;
  dissonance: number;
};

export type DissonanceCurveData = {
  interval: {
    n: number;
    d: number;
  };
  dissonance: number;
}[];

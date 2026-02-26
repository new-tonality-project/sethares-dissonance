import type Fraction from "fraction.js";
import type { SETHARES_DISSONANCE_PARAMS } from "./const";

export type SetharesDissonanceParams = Partial<typeof SETHARES_DISSONANCE_PARAMS>;

export type DissonanceParams = SetharesDissonanceParams & {
  firstOrderContribution: number;
  secondOrderContribution: number;
  thirdOrderContribution: number;
  phantomHarmonicsNumber: number;
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

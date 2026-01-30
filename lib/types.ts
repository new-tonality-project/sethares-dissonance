import type Fraction from "fraction.js";
import type { SECOND_ORDER_BEATING_PARAMS, SETHARES_DISSONANCE_PARAMS } from "./const";

export type SecondOrderBeatingTerm = {
  ratio: number;
  magnitude: number;
};

export type SetharesDissonanceParams = Partial<typeof SETHARES_DISSONANCE_PARAMS>;
export type SecondOrderBeatingParams = Partial<typeof SECOND_ORDER_BEATING_PARAMS>;

export type DissonanceParams = SetharesDissonanceParams & {
  secondOrderBeating?: SecondOrderBeatingParams;
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
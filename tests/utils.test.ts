import { expect, test, describe } from "bun:test";

import * as Utils from "../lib/utils";

describe("lib/utils", () => {
  test("Should calculate loudness", () => {
    const amplitudes = [1, 0.001, 0.000025];
    const expectedOutcome = [64, 1, 0];

    expect(amplitudes.map(Utils.getLoudness)).toEqual(expectedOutcome);
  });
});

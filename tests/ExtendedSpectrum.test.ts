import { describe, test, expect } from "bun:test";
import { ExtendedSpectrum } from "../classes/private/ExtendedSpectrum";

const sine = new ExtendedSpectrum([
  { frequency: { n: 100, d: 1 }, amplitude: 1, phase: 0, phantom: false },
]);
const hSeries = new ExtendedSpectrum([
  { frequency: { n: 100, d: 1 }, amplitude: 1, phase: 0, phantom: false },
  { frequency: { n: 200, d: 1 }, amplitude: 0.5, phase: 0, phantom: false },
  { frequency: { n: 300, d: 1 }, amplitude: 0.25, phase: 0, phantom: false },
]);
const phantomSeries = new ExtendedSpectrum([
  { frequency: { n: 1, d: 1 }, amplitude: 1, phase: 0, phantom: true },
  { frequency: { n: 2, d: 1 }, amplitude: 0.5, phase: 0, phantom: true },
  { frequency: { n: 3, d: 1 }, amplitude: 0.25, phase: 0, phantom: true },
]);

describe("ExtendedSpectrum.mul", () => {
  describe("basic multiplication", () => {
    test("sine × hSeries multiplies correctly", () => {
      const result = sine.mul(hSeries);

      expect(result.size).toBe(3);
      const freqs = result.getFrequenciesAsNumbers();
      expect(freqs).toEqual([100, 200, 300]);
    });

    test("hSeries × phantomSeries computes product of intervals", () => {
      const result = hSeries.mul(phantomSeries);

      expect(result.size).toBe(6);
      const freqs = result.getFrequenciesAsNumbers();
      expect(freqs).toContainEqual(100);
      expect(freqs).toContainEqual(200);
      expect(freqs).toContainEqual(300);
      expect(freqs).toContainEqual(400);
      expect(freqs).toContainEqual(600);
      expect(freqs).toContainEqual(900);
    });
  });

  describe("phantom logic", () => {
    test("sine × phantomSeries → 100 Hz stays real (× fundamental), rest phantom", () => {
      const result = sine.mul(phantomSeries);

      const at100 = result.get(100);
      expect(at100).toBeDefined();
      expect(at100!.phantom).toBe(false);

      const at200 = result.get(200);
      const at300 = result.get(300);
      expect(at200!.phantom).toBe(true);
      expect(at300!.phantom).toBe(true);
    });

    test("phantomSeries × sine → all phantom", () => {
      const result = phantomSeries.mul(sine);

      for (const h of result.getHarmonics()) {
        expect(h.phantom).toBe(true);
      }
    });

    test("hSeries × hSeries → all non-phantom", () => {
      const result = hSeries.mul(hSeries);

      for (const h of result.getHarmonics()) {
        expect(h.phantom).toBe(false);
      }
    });
  });

  describe("collision: non-phantom wins", () => {
    test("non-phantom replaces phantom when frequencies collide", () => {
      const mixed = new ExtendedSpectrum([
        { frequency: { n: 1, d: 1 }, amplitude: 1, phase: 0, phantom: false },
        { frequency: { n: 2, d: 1 }, amplitude: 1, phase: 0, phantom: true },
      ]);
      const result = hSeries.mul(mixed);

      const at200 = result.get(200);
      expect(at200).toBeDefined();
      expect(at200!.phantom).toBe(false);
    });

    test("phantom does not replace non-phantom when frequencies collide", () => {
      const mixed = new ExtendedSpectrum([
        { frequency: { n: 1, d: 1 }, amplitude: 1, phase: 0, phantom: false },
        { frequency: { n: 2, d: 1 }, amplitude: 1, phase: 0, phantom: true },
      ]);
      const result = mixed.mul(hSeries);

      const at2 = result.get(2);
      expect(at2).toBeDefined();
      expect(at2!.phantom).toBe(false);
    });

    test("first wins when both phantom collide", () => {
      const result = phantomSeries.mul(phantomSeries);

      const at2 = result.get(2);
      expect(at2).toBeDefined();
      expect(at2!.phantom).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("throws when other spectrum is empty", () => {
      const empty = new ExtendedSpectrum();

      expect(() => sine.mul(empty)).toThrow(
        "Other spectrum has no fundamental (empty or not computable)"
      );
    });

    test("returns empty when this spectrum is empty", () => {
      const empty = new ExtendedSpectrum();

      const result = empty.mul(sine);

      expect(result.size).toBe(0);
    });

    test("sine × sine → single harmonic", () => {
      const result = sine.mul(sine);

      expect(result.size).toBe(1);
      expect(result.getHarmonics()[0]!.frequencyNum).toBe(100);
      expect(result.getHarmonics()[0]!.amplitude).toBeCloseTo(1);
    });
  });
});

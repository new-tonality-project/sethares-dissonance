import { describe, test, expect } from "bun:test";
import Fraction from "fraction.js";
import { DissonanceCurve } from "../classes";
import { Spectrum } from "tuning-core";

function createTestCurve() {
  const context = Spectrum.harmonic(6, 440);
  const complement = Spectrum.harmonic(6, 440);
  return new DissonanceCurve({
    context,
    complement,
    start: 1,
    end: 2,
    maxDenominator: 60,
  });
}

describe("DissonanceCurve", () => {
  describe("findNearestPoint", () => {
    describe("ratios that exist in the curve", () => {
      test("returns exact point when ratio is in curve (number)", () => {
        const curve = createTestCurve();
        const points = curve.points;
        const firstPoint = points[0]!;

        const result = curve.findNearestPoint(firstPoint.interval.valueOf());
        expect(result).toBeDefined();
        expect(result?.interval.compare(firstPoint.interval)).toBe(0);
        expect(result?.dissonance).toBe(firstPoint.dissonance);
      });

      test("returns exact point when ratio is in curve (string)", () => {
        const curve = createTestCurve();
        const points = curve.points;
        const midPoint = points[Math.floor(points.length / 2)]!;

        const result = curve.findNearestPoint(midPoint.interval.toFraction());
        expect(result).toBeDefined();
        expect(result?.interval.compare(midPoint.interval)).toBe(0);
      });

      test("returns exact point when ratio is in curve (Fraction)", () => {
        const curve = createTestCurve();
        const points = curve.points;
        const lastPoint = points[points.length - 1]!;

        const result = curve.findNearestPoint(new Fraction(lastPoint.interval));
        expect(result).toBeDefined();
        expect(result?.interval.compare(lastPoint.interval)).toBe(0);
      });

      test("returns exact point for ratio 1 (unison)", () => {
        const curve = createTestCurve();
        const result = curve.findNearestPoint(1);
        expect(result).toBeDefined();
        expect(result?.interval.compare(1)).toBe(0);
      });

      test("returns exact point for ratio 2 (octave)", () => {
        const curve = createTestCurve();
        const result = curve.findNearestPoint(2);
        expect(result).toBeDefined();
        expect(result?.interval.compare(2)).toBe(0);
      });
    });

    describe("ratios that do not exist in the curve", () => {
      test("returns ceiling point when ratio is between two calculated points", () => {
        const curve = createTestCurve();
        const points = curve.points;

        if (points.length < 2) return;

        const left = points[0]!;
        const right = points[1]!;
        const between = Math.sqrt(left.interval.valueOf() * right.interval.valueOf());

        const result = curve.findNearestPoint(between);
        expect(result).toBeDefined();
        expect(result?.interval.compare(right.interval)).toBe(0);
      });

      test("returns first point when ratio is below curve range", () => {
        const curve = createTestCurve();
        const points = curve.points;
        const minRatio = points[0]!.interval.valueOf();

        const result = curve.findNearestPoint(minRatio * 0.5);
        expect(result).toBeDefined();
        expect(result?.interval.compare(points[0]!.interval)).toBe(0);
      });

      test("returns last point when ratio is above curve range", () => {
        const curve = createTestCurve();
        const points = curve.points;
        const lastPoint = points[points.length - 1]!;

        const result = curve.findNearestPoint(lastPoint.interval.valueOf() * 2);
        expect(result).toBeDefined();
        expect(result?.interval.compare(lastPoint.interval)).toBe(0);
      });

      test("returns correct point for ratio just below an existing point", () => {
        const curve = createTestCurve();
        const points = curve.points;

        if (points.length < 2) return;

        const target = points[1]!;
        const justBelow = target.interval.valueOf() - 0.001;

        const result = curve.findNearestPoint(justBelow);
        expect(result).toBeDefined();
        expect(result?.interval.compare(target.interval)).toBe(0);
      });

      test("returns ceiling point when ratio is just above an existing point", () => {
        const curve = createTestCurve();
        const points = curve.points;

        if (points.length < 2) return;

        const current = points[1]!;
        const justAboveCurrent = current.interval.valueOf() + 0.001;

        const result = curve.findNearestPoint(justAboveCurrent);
        expect(result).toBeDefined();
        expect(result!.interval.compare(justAboveCurrent)).toBeGreaterThanOrEqual(0);
      });
    });

    describe("FractionInput types", () => {
      test("accepts number input", () => {
        const curve = createTestCurve();
        const result = curve.findNearestPoint(1.5);
        expect(result).toBeDefined();
      });

      test("accepts string fraction input", () => {
        const curve = createTestCurve();
        const result = curve.findNearestPoint("3/2");
        expect(result).toBeDefined();
      });

      test("accepts Fraction object input", () => {
        const curve = createTestCurve();
        const result = curve.findNearestPoint(new Fraction(5, 4));
        expect(result).toBeDefined();
      });
    });
  });
});

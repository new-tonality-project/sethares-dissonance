import { Spectrum } from "tuning-core";
import { DissonanceCurve } from "../classes";

/**
 * Performance benchmark for DissonanceCurve creation.
 * Tests creating a dissonance curve with harmonic spectra (6 harmonics, 440 Hz),
 * range 0.25–4, and Sethares parameters.
 */

const ITERATIONS = 100;

interface BenchmarkResult {
  operation: string;
  timeMs: number;
  timePerOpMs: number;
  iterations: number;
}

function benchmark(name: string, fn: () => void): BenchmarkResult {
  // Warmup
  for (let i = 0; i < 10; i++) {
    fn();
  }

  // Actual benchmark
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    fn();
  }
  const end = performance.now();

  const timeMs = end - start;
  const timePerOpMs = timeMs / ITERATIONS;

  return {
    operation: name,
    timeMs,
    timePerOpMs,
    iterations: ITERATIONS,
  };
}

function runBenchmarks(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  const options = {
      context: Spectrum.harmonic(6, 440),
      complement: Spectrum.harmonic(6, 440),
      start: 1,
      end: 2,
      firstOrderContribution: 1,
      secondOrderContribution: 0.25,
      thirdOrderContribution: 0.1,
      phantomHarmonicsNumber: 3,
      maxGapCents: 30,
  }

  const sampleCurve = new DissonanceCurve(options);
  console.log(`Test setup: Spectrum.harmonic(6, 440), range 0.25–4, curve points: ${sampleCurve.points.length}\n`);

  results.push(
    benchmark("DissonanceCurve creation", () => {
      new DissonanceCurve(options)
    })
  );

  return results;
}

function formatResults(results: BenchmarkResult[]): void {
  console.log("=".repeat(80));
  console.log("DissonanceCurve Creation Performance Benchmark");
  console.log(`Iterations per test: ${ITERATIONS.toLocaleString()}`);
  console.log("=".repeat(80));
  console.log("\n");

  const fastest = results.reduce((min, r) => (r.timeMs < min.timeMs ? r : min), results[0]!);

  console.log("Results:");
  console.log("-".repeat(80));
  console.log(
    `${"Operation".padEnd(45)} ${"Total Time (ms)".padEnd(18)} ${"Time per Op (ms)".padEnd(18)} ${"Relative Speed".padEnd(15)}`
  );
  console.log("-".repeat(80));

  for (const result of results) {
    const relativeSpeed = (result.timeMs / fastest.timeMs).toFixed(2) + "x";
    const timeMsStr = result.timeMs.toFixed(2);
    const timePerOpStr = result.timePerOpMs.toFixed(4);

    console.log(
      `${result.operation.padEnd(45)} ${timeMsStr.padEnd(18)} ${timePerOpStr.padEnd(18)} ${relativeSpeed.padEnd(15)}`
    );
  }

  console.log("-".repeat(80));
  console.log(`\nFastest: ${fastest.operation} (${fastest.timeMs.toFixed(2)} ms)`);
  console.log("=".repeat(80) + "\n");
}

const results = runBenchmarks();
formatResults(results);

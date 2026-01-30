import Fraction from 'fraction.js';
import { Spectrum } from '../Spectrum';
import type { SpectrumData } from '../types';

/**
 * Performance benchmark for Spectrum serialization and deserialization.
 * Tests creating a Spectrum with fundamental of 10 and 100 harmonics,
 * then performing 1000 serialization/deserialization passes.
 */

const ITERATIONS = 10_000;
const HARMONIC_COUNT = 100;
const FUNDAMENTAL = 1234/567;

// Create a test spectrum with fundamental 10 and 100 harmonics
function createTestSpectrum(): Spectrum {
  const spectrum = new Spectrum();
  
  for (let i = 1; i <= HARMONIC_COUNT; i++) {
    const frequency = FUNDAMENTAL * i;
    const amplitude = 1 / i; // Natural decay
    const phase = 0;
    spectrum.add(frequency, amplitude, phase);
  }
  
  return spectrum;
}

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
  
  // Create test spectrum once
  const testSpectrum = createTestSpectrum();
  console.log(`Created test spectrum with ${testSpectrum.size} harmonics`);
  console.log(`Fundamental: ${FUNDAMENTAL} Hz, Highest harmonic: ${FUNDAMENTAL * HARMONIC_COUNT} Hz\n`);

  // Benchmark 1: Serialization (toJSON)
  let serializedData: SpectrumData | null = null;
  results.push(
    benchmark('Serialization (toJSON)', () => {
      serializedData = testSpectrum.toJSON();
    })
  );

  if (!serializedData) {
    throw new Error('Serialization failed');
  }

  // Benchmark 2: Deserialization (new Spectrum(data))
  results.push(
    benchmark('Deserialization (new Spectrum(data))', () => {
      new Spectrum(serializedData!);
    })
  );

  // Benchmark 3: Round-trip (serialize + deserialize)
  results.push(
    benchmark('Round-trip (serialize + deserialize)', () => {
      const data = testSpectrum.toJSON();
      new Spectrum(data);
    })
  );

  // Benchmark 4: Verify correctness
  const deserialized = new Spectrum(serializedData);
  const isEqual = testSpectrum.size === deserialized.size &&
    Array.from(testSpectrum.getHarmonics()).every((h1, i) => {
      const h2 = deserialized.getHarmonics()[i];
      if (!h2) return false;
      return h1.frequencyStr === h2.frequencyStr &&
        Math.abs(h1.amplitude - h2.amplitude) < 1e-10 &&
        Math.abs(h1.phase - h2.phase) < 1e-10;
    });
  
  console.log(`Verification: Round-trip preserves data correctly: ${isEqual ? '✓' : '✗'}\n`);

  return results;
}

function formatResults(results: BenchmarkResult[]): void {
  console.log('='.repeat(80));
  console.log(`Spectrum Serialization/Deserialization Performance Benchmark`);
  console.log(`Test Spectrum: ${HARMONIC_COUNT} harmonics, fundamental ${FUNDAMENTAL} Hz`);
  console.log(`Iterations per test: ${ITERATIONS.toLocaleString()}`);
  console.log('='.repeat(80));
  console.log('\n');

  // Find the fastest
  const fastest = results.reduce((min, r) => (r.timeMs < min.timeMs ? r : min), results[0]!);

  console.log('Results:');
  console.log('-'.repeat(80));
  console.log(
    `${'Operation'.padEnd(45)} ${'Total Time (ms)'.padEnd(18)} ${'Time per Op (ms)'.padEnd(18)} ${'Relative Speed'.padEnd(15)}`
  );
  console.log('-'.repeat(80));

  for (const result of results) {
    const relativeSpeed = (result.timeMs / fastest.timeMs).toFixed(2) + 'x';
    const timeMsStr = result.timeMs.toFixed(2);
    const timePerOpStr = result.timePerOpMs.toFixed(4);

    console.log(
      `${result.operation.padEnd(45)} ${timeMsStr.padEnd(18)} ${timePerOpStr.padEnd(18)} ${relativeSpeed.padEnd(15)}`
    );
  }

  console.log('-'.repeat(80));
  console.log(`\nFastest: ${fastest.operation} (${fastest.timeMs.toFixed(2)} ms)`);
  console.log('='.repeat(80) + '\n');

  // Additional statistics
  const serialization = results.find(r => r.operation.includes('Serialization'));
  const deserialization = results.find(r => r.operation.includes('Deserialization'));
  const roundTrip = results.find(r => r.operation.includes('Round-trip'));

  if (serialization && deserialization && roundTrip) {
    console.log('Breakdown:');
    console.log(`  Serialization: ${serialization.timePerOpMs.toFixed(4)} ms per operation`);
    console.log(`  Deserialization: ${deserialization.timePerOpMs.toFixed(4)} ms per operation`);
    console.log(`  Round-trip: ${roundTrip.timePerOpMs.toFixed(4)} ms per operation`);
    console.log(`  Expected round-trip: ${(serialization.timePerOpMs + deserialization.timePerOpMs).toFixed(4)} ms`);
    console.log(`  Overhead: ${(roundTrip.timePerOpMs - serialization.timePerOpMs - deserialization.timePerOpMs).toFixed(4)} ms\n`);
  }
}

// Run benchmarks
const results = runBenchmarks();
formatResults(results);

// Show sample of serialized data
const sampleSpectrum = createTestSpectrum();
const sampleData = sampleSpectrum.toJSON();
console.log('Sample serialized data (first 3 harmonics):');
console.log(JSON.stringify(sampleData.slice(0, 3), null, 2));
console.log(`\nTotal harmonics in serialized data: ${sampleData.length}`);
console.log(`Average size per harmonic: ${(JSON.stringify(sampleData).length / sampleData.length).toFixed(2)} bytes`);

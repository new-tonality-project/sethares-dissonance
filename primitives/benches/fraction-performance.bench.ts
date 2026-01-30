import Fraction from 'fraction.js';

/**
 * Performance benchmark for Fraction.js constructor with different input types.
 * Tests creating 10,000 Fraction objects from various input formats.
 */

const ITERATIONS = 100_000_000;

// A relatively complex ratio for testing
const COMPLEX_RATIO_STRING = '440';
const COMPLEX_RATIO_FLOAT = 440;
const COMPLEX_RATIO_ARRAY: [number, number] = [440, 1];
const COMPLEX_RATIO_OBJECT = { n: 440, d: 1 };
const COMPLEX_RATIO_FRACTION = new Fraction(440, 1);

interface BenchmarkResult {
  inputType: string;
  timeMs: number;
  timePerOpNs: number;
  iterations: number;
}

function benchmark(name: string, fn: () => void): BenchmarkResult {
  // Warmup
  for (let i = 0; i < 100; i++) {
    fn();
  }

  // Actual benchmark
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    fn();
  }
  const end = performance.now();

  const timeMs = end - start;
  const timePerOpNs = (timeMs / ITERATIONS) * 1_000_000; // Convert to nanoseconds

  return {
    inputType: name,
    timeMs,
    timePerOpNs,
    iterations: ITERATIONS,
  };
}

function runBenchmarks(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  // Test 1: String input
  results.push(
    benchmark('String ("440")', () => {
      new Fraction(COMPLEX_RATIO_STRING);
    })
  );

  // Test 2: Float input
  results.push(
    benchmark('Float (440)', () => {
      new Fraction(COMPLEX_RATIO_FLOAT);
    })
  );

  // Test 3: Array input
  results.push(
    benchmark('Array ([440, 1])', () => {
      new Fraction(COMPLEX_RATIO_ARRAY);
    })
  );

  // Test 4: Object input
  results.push(
    benchmark('Object ({n: 440, d: 1})', () => {
      new Fraction(COMPLEX_RATIO_OBJECT);
    })
  );

  // Test 5: Fraction input (copying)
  results.push(
    benchmark('Fraction (copying existing)', () => {
      new Fraction(COMPLEX_RATIO_FRACTION);
    })
  );

  return results;
}

function formatResults(results: BenchmarkResult[]): void {
  console.log('\n' + '='.repeat(80));
  console.log(`Fraction.js Constructor Performance Benchmark`);
  console.log(`Iterations per test: ${ITERATIONS.toLocaleString()}`);
  console.log('='.repeat(80));
  console.log('\n');

  // Find the fastest
  const fastest = results.reduce((min, r) => (r.timeMs < min.timeMs ? r : min), results[0]!);

  console.log('Results:');
  console.log('-'.repeat(80));
  console.log(
    `${'Input Type'.padEnd(35)} ${'Total Time (ms)'.padEnd(18)} ${'Time per Op (ns)'.padEnd(18)} ${'Relative Speed'.padEnd(15)}`
  );
  console.log('-'.repeat(80));

  for (const result of results) {
    const relativeSpeed = (result.timeMs / fastest.timeMs).toFixed(2) + 'x';
    const timeMsStr = result.timeMs.toFixed(2);
    const timePerOpStr = result.timePerOpNs.toFixed(2);

    console.log(
      `${result.inputType.padEnd(35)} ${timeMsStr.padEnd(18)} ${timePerOpStr.padEnd(18)} ${relativeSpeed.padEnd(15)}`
    );
  }

  console.log('-'.repeat(80));
  console.log(`\nFastest: ${fastest.inputType} (${fastest.timeMs.toFixed(2)} ms)`);
  console.log('='.repeat(80) + '\n');
}

// Run benchmarks
const results = runBenchmarks();
formatResults(results);

// Verify all produce the same result
console.log('Verification: All input types produce the same Fraction:');
const f1 = new Fraction(COMPLEX_RATIO_STRING);
const f2 = new Fraction(COMPLEX_RATIO_FLOAT);
const f3 = new Fraction(COMPLEX_RATIO_ARRAY);
const f4 = new Fraction(COMPLEX_RATIO_OBJECT);
const f5 = new Fraction(COMPLEX_RATIO_FRACTION);

console.log(`String:   ${f1.toFraction()} = ${f1.valueOf()}`);
console.log(`Float:    ${f2.toFraction()} = ${f2.valueOf()}`);
console.log(`Array:    ${f3.toFraction()} = ${f3.valueOf()}`);
console.log(`Object:   ${f4.toFraction()} = ${f4.valueOf()}`);
console.log(`Fraction: ${f5.toFraction()} = ${f5.valueOf()}`);

const allEqual =
  f1.equals(f2) && f2.equals(f3) && f3.equals(f4) && f4.equals(f5);
console.log(`\nAll results equal: ${allEqual ? '✓' : '✗'}`);

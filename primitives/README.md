# New Tonality Tuning Core

A set of primitive classes for representing harmonics, spectrum, and frequency ratios using exact rational number arithmetic. These classes are used across the New Tonality project ecosystem, including:

- **[new-tonality-website-v3](https://github.com/new-tonality-project/new-tonality-website-v3)** - Main website and web tools
- **[sethares-dissonance](https://github.com/new-tonality-project/sethares-dissonance)** - Dissonance curve calculations
- **[set-consonance](https://github.com/new-tonality-project/set-consonance)** - Set-theorietic consonance analysis tools

The primitives provide a foundation for precise tuning mathematics, avoiding floating-point errors through the use of `Fraction.js` for exact rational number representation.

## Contributing

Found a bug or have a feature request? Please don't hesitate to reach out!

- **GitHub Issues**: Report bugs or request features by opening an issue on the [GitHub repository](https://github.com/new-tonality-project/tuning-core)
- **Email**: Send feedback directly to [support@newtonality.net](mailto:support@newtonality.net)

Your feedback helps improve the New Tonality Tuning Core for everyone!


## Usage Examples

### Frequency and Interval Representation

All frequencies and intervals are handled as (Fraction.js)[https://www.npmjs.com/package/fraction.js?activeTab=readme] objects internally, which allows for exact representation of rational numbers. This is crucial for precise tuning mathematics and avoids floating-point errors. However that may lead to performance issues due to conversion of very percise floating point numbers like 1.0001230576.

You can provide frequencies and intervals using any of the following `FractionInput` types,
it will automatically be converted to Fraction object interanlly.

```ts
new Harmonic(100.25)                // 100.25 Hz
new Harmonic("100.25")              // 100.25 Hz
new Harmonic("100 1/4")             // 100.25 Hz
new Harmonic(new Fraction(100.25))  // 100.25 Hz

// working with intervals:

const h = new Harmonic(100)

const perfectFifth = h.toTransposed("3/2")          // 150 Hz
const perfectFourth = h.toTransposed([4, 3])        // 133.33.. Hz
const majorThird = h.toTransposed({ n: 5, d: 4 })   // 125 Hz
const perfectOctave = h.toTransposed(2)             // 200 Hz
```

If you already have a Fraction object, it is also a valid input:

```ts
import Fraction from 'fraction.js';

const f = new Fraction("4/3")
const h = new Harmonic(440).transpose(f) // OK
```

**Note**: When using string fractions (e.g., `"3/2"`), the fraction is automatically simplified. For example, `"6/4"` becomes `"3/2"`.

### Harmonic class

```ts
import { Harmonic } from 'tuning-core';

// Create harmonic with individual parameters
// Frequencies represent partials (e.g., from harmonic series: 110, 220, 330 Hz)
const h1 = new Harmonic(220, 0.5, 0);     // 220 Hz, amplitude 0.5
const h2 = new Harmonic("330", 0.8);      // 330 Hz, phase defaults to 0
const h3 = new Harmonic("110 1/4");       // 110.25 Hz, amplitude defaults to 1

// Access properties (read-only)
console.log(h1.frequency);      // Fraction  obj
console.log(h1.frequencyStr);   // "220"
console.log(h1.frequencyNum);   // 220
console.log(h1.amplitude);      // 0.5
console.log(h1.phase);          // 0

// Modify harmonic (methods can be chained)
h1.setAmplitude(0.7).setPhase(Math.PI);
h1.scale(0.5);  // Scale amplitude by 0.5

// Transpose using musical intervals (ratios) in place
h1.transpose('3/2');  // Transpose by perfect fifth (multiply frequency by 3/2)
h1.transpose('4/3');  // Transpose by perfect fourth (multiply frequency by 4/3)

// Create several harmonics using transposition
const h2 = h1.toTransposed("3/2") // perfect fifth 
const copy = h1.clone()

// Serialization
const h = new Harmonic(100, 0.5, Math.PI)
const harmonicData: HarmonicData = h.toJSON()
console.log(harmonicData)
// Output: { frequency: '100', amplitude: 0.5, phase: 3.141592653589793 }

// serialized data can be used to counstruct a new Harmonic
const deserializedharmonic = new Harmonic(harmonicData)
```

### Spectrum class

Spectrum is a collection of individual Harmonics. Under the hood it is a Map with keys that are frequency strings, that is done to avoid duplicates. Adding new harmonic with existing frequency will override the existing harmonic.

```ts
import { Spectrum } from 'tuning-core';

// Create empty spectrum
const s1 = new Spectrum();

// Add harmonics using various methods
// Frequencies represent partials (e.g., from harmonic series: 110, 220, 330 Hz)
s1.add(110, 1.0);                                         // Add by frequency (Hz)
s1.add(220, 0.5, Math.PI);                                // Add with phase
s1.add(new Harmonic(330, 0.33));                          // Add Harmonic object
s1.add({ frequency: '440', amplitude: 0.6, phase: 0 });   // Add HarmonicData

// Query spectrum
s1.has(220);           // Check if harmonic exists
s1.get(220);           // Get harmonic (returns Harmonic | undefined)
s1.size;               // Number of harmonics
s1.isEmpty();          // Check if empty

// Modify spectrum
s1.remove(220);        // Remove harmonic
s1.scaleAmplitudes(0.5);  // Scale all amplitudes
s1.clear();            // Remove all harmonics
s1.transposeHarmonic(220, "3/2");  // Transposes a single harmonic a fifth up

// Transpose using musical intervals (ratios)
s1.transpose('3/2');   // Transpose all harmonics by perfect fifth (mutable)
s1.transpose('4/3');   // Transpose all harmonics by perfect fourth

// Get harmonics
const harmonics = s1.getHarmonics();  // Returns sorted array
const lowest = s1.getLowestHarmonic();
const highest = s1.getHighestHarmonic();

// Clone and immutable operations
const s3 = s1.clone();              // Create independent copy
const s4 = s1.toTransposed('3/2');  // Create transposed copy (immutable) - perfect fifth

// Serialization
const spectrum = new Speacrum()

spectrum.add(110, 1, 0)
spectrum.add(220, 0.5, 1)

const spectrumData: SpectrumData = spectrum.toJSON()
console.log(spectrumData)
// output: [
//  { frequency: 110, amplitude: 1, phase: 0 },
//  { frequency: 220, amplitude: 0.5, phase: 1 }
// ]

// Deserialisation
const s2 = new Spectrum(spectrumData); // OK
```

### Spectrum static methods

A set of convenience factory methods to create common spectra such as harmonic series and others

```ts
import { Spectrum } from 'tuning-core';

// Create harmonic series (frequency ratios: 1, 2, 3, 4, ...)
// These represent the harmonic series relative to a fundamental
const harmonicSeries = Spectrum.harmonicSeries(8);
// Creates spectrum with ratios 1, 2, 3, 4, 5, 6, 7, 8
// Amplitudes follow natural decay: 1, 0.5, 0.333, 0.25, ...

// Create spectrum from absolute frequencies (Hz)
const spectrum = Spectrum.fromFrequencies(
  [110, 220, 330, 440],   // Frequencies in Hz (harmonic series)
  [1.0, 0.5, 0.33, 0.25], // Amplitudes
  [0, 0, 0, 0]            // Phases
);
```

### Performance Considerations

The performance of `Fraction.js` constructor varies significantly depending on the input type and ratio complexity. Benchmarks show different characteristics for integers vs. simple vs. complex ratios:

**Integers (e.g., `440`) measured for 100_000_000 iterations:**
| Input Type | Time per Operation | Relative Speed |
|------------|-------------------|----------------|
| **Float** `440` | 88 ns | 1.00x (fastest) |
| **Array** `[440, 1]` | 114 ns | 1.30x |
| **Object** `{n: 440, d: 1}` | 114 ns | 1.30x |
| **Fraction (copying)** | 143 ns | 1.63x |
| **String** `"440"` | 237 ns | 2.70x (slowest) |

**Simple Ratios (e.g., `3/2`) measured for 100_000_000 iterations:**
| Input Type | Time per Operation | Relative Speed |
|------------|-------------------|----------------|
| **Object** `{n: 3, d: 2}` | 131 ns | 1.00x (fastest) |
| **Array** `[3, 2]` | 132 ns | 1.01x |
| **Fraction (copying)** | 160 ns | 1.22x |
| **Float** `1.5` | 231 ns | 1.77x |
| **String** `"3/2"` | 321 ns | 2.45x (slowest) |

**Complex Ratios (e.g., `12345/6789`) measured for 10_000_000 iterations:**
| Input Type | Time per Operation | Relative Speed |
|------------|-------------------|----------------|
| **Fraction (copying)** | 279 ns | 1.00x (fastest) |
| **Object** `{n, d}` | 286 ns | 1.02x |
| **Array** `[n, d]` | 287 ns | 1.03x |
| **String** `"n/d"` | 506 ns | 1.81x |
| **Float** `1.818...` | 2,826 ns | **10.12x** (slowest) |

**Key Recommendations:**

1. **For integers, floats are fastest**: When working with whole numbers (e.g., `440` Hz), using a float/number directly is the fastest option (~1.3x faster than array/object). However, arrays/objects are still very fast and provide consistency.

2. **Use arrays or objects for ratios**: For both simple and complex ratios, array `[numerator, denominator]` or object `{n: numerator, d: denominator}` formats consistently provide the best performance. They are the fastest option for simple ratios and nearly as fast as copying for complex ratios.

3. **Avoid floats for complex intervals**: Float input becomes **~10x slower** for complex ratios because `Fraction.js` must convert the decimal to a rational approximation. For simple ratios, floats are better than strings but still slower than array/object.

4. **String parsing overhead**: String fractions add parsing overhead (~2.7x slower for integers, ~2.5x for simple ratios, ~1.8x for complex ratios). The overhead is not that great so they can be used for improved readability, but avoid them for performance-critical code.

5. **Reuse Fraction objects when possible**: Copying an existing `Fraction` object has comparable performance to construction from array or object

**Example - Performance Best Practices:**

```ts
// ✅ FASTEST FOR INTEGERS: Floats are fastest for whole numbers
const fastestInt = new Harmonic(440);  // Float input is fastest for integers

// ✅ FASTEST FOR RATIOS: Use array/object for best performance
const fastest1 = new Harmonic(440).transpose([3, 2]);  // Simple ratio
const fastest2 = new Harmonic(440).transpose({ n: 3, d: 2 });  // Simple ratio
const fastest3 = new Harmonic(440).transpose([12345, 6789]);  // Complex ratio

// ✅ GOOD: String fractions for readability (acceptable performance)
const readable = new Harmonic(440).transpose("3/2");  // ~2.5x slower than array

// ⚠️ AVOID: Floats for complex ratios (very slow)
const slowComplex = new Harmonic(440).transpose(1.8181818181818182);  // ~10x slower

// ⚠️ ACCEPTABLE: Floats for simple ratios (but array/object still faster)
const acceptable = new Harmonic(440).transpose(1.5);  // ~1.8x slower than array
```

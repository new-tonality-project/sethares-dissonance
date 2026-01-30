import { describe, test, expect } from 'bun:test';
import Fraction from 'fraction.js';
import { Harmonic } from './Harmonic';
import { Spectrum } from './Spectrum';

describe('Spectrum instatnce', () => {
  describe('constructor', () => {
    test('creates empty spectrum', () => {
      const s = new Spectrum();
      expect(s.size).toBe(0);
      expect(s.isEmpty()).toBe(true);
    });

    test('creates spectrum from SpectrumData', () => {
      const s = new Spectrum([
        { frequency: { n: 100, d: 1 }, amplitude: 0.5, phase: 0 },
        { frequency: { n: 200, d: 1 }, amplitude: 0.3, phase: Math.PI }
      ]);
      expect(s.size).toBe(2);
      expect(s.has(100)).toBe(true);
      expect(s.has(200)).toBe(true);
    });

    test('deserializes harmonics correctly', () => {
      const s = new Spectrum([
        { frequency: { n: 100, d: 1 }, amplitude: 0.8, phase: 0 },
        { frequency: { n: 200, d: 1 }, amplitude: 0.5, phase: Math.PI / 2 }
      ]);

      const h1 = s.get(100);
      expect(h1?.amplitude).toBe(0.8);
      expect(h1?.phase).toBe(0);

      const h2 = s.get(200);
      expect(h2?.amplitude).toBe(0.5);
      expect(h2?.phase).toBe(Math.PI / 2);
    });
  });

  describe('add', () => {
    test('adds harmonic from Harmonic object', () => {
      const s = new Spectrum();
      const h = new Harmonic(100, 1);
      s.add(h);
      expect(s.size).toBe(1);
    });

    test('adds harmonic from HarmonicData', () => {
      const s = new Spectrum();
      s.add({ frequency: { n: 200, d: 1 }, amplitude: 0.5, phase: 0 });
      expect(s.size).toBe(1);
      const h = s.get(200);
      expect(h?.amplitude).toBe(0.5);
    });

    test('adds harmonic from parameters (Fraction)', () => {
      const s = new Spectrum();
      s.add(new Fraction(200), 0.5, Math.PI);
      expect(s.size).toBe(1);
      const h = s.get(200);
      expect(h?.amplitude).toBe(0.5);
    });

    test('adds harmonic from parameters (number)', () => {
      const s = new Spectrum();
      s.add(200, 0.8);
      expect(s.size).toBe(1);
      const h = s.get(200);
      expect(h?.amplitude).toBe(0.8);
    });

    test('adds harmonic from parameters (string)', () => {
      const s = new Spectrum();
      s.add('300', 0.6);
      expect(s.size).toBe(1);
      const h = s.get(300);
      expect(h?.amplitude).toBe(0.6);
    });

    test('uses default amplitude and phase', () => {
      const s = new Spectrum();
      s.add(100);
      const h = s.get(100);
      expect(h?.amplitude).toBe(1);
      expect(h?.phase).toBe(0);
    });

    test('adds multiple harmonics', () => {
      const s = new Spectrum();
      s.add(100, 1);
      s.add(200, 0.5);
      s.add(300, 0.33);
      expect(s.size).toBe(3);
    });

    test('replaces harmonic with same frequency', () => {
      const s = new Spectrum();
      s.add('300', 0.5);
      s.add(300, 0.8); // Same frequency, different amplitude

      expect(s.size).toBe(1);
      const h = s.get(300);
      expect(h?.amplitude).toBe(0.8);
    });

    test('treats equivalent fractions as same key', () => {
      const s = new Spectrum();
      s.add('6/4', 0.5);
      s.add('3/2', 0.8);

      expect(s.size).toBe(1); // Should replace, as 6/4 = 3/2
      const h = s.get('3/2');
      expect(h?.amplitude).toBe(0.8);
    });
  });

  describe('get', () => {
    test('retrieves harmonic by Harmonic object', () => {
      const s = new Spectrum();
      const h1 = new Harmonic(200, 0.5);
      s.add(h1);
      const h2 = s.get(h1);
      expect(h2?.amplitude).toBe(0.5);
    });

    test('retrieves harmonic by Fraction', () => {
      const s = new Spectrum();
      s.add(new Fraction(3, 2), 0.5);
      const h = s.get(new Fraction(3, 2));
      expect(h?.amplitude).toBe(0.5);
    });

    test('retrieves harmonic by number', () => {
      const s = new Spectrum();
      s.add(300, 0.8);
      const h = s.get(300);
      expect(h?.amplitude).toBe(0.8);
    });

    test('retrieves harmonic by string', () => {
      const s = new Spectrum();
      s.add('300', 0.6);
      const h = s.get('300');
      expect(h?.amplitude).toBe(0.6);
    });

    test('returns undefined for non-existent harmonic', () => {
      const s = new Spectrum();
      s.add(100, 1);
      const h = s.get(200);
      expect(h).toBeUndefined();
    });

    test('finds harmonic using equivalent fraction', () => {
      const s = new Spectrum();
      s.add('3/2', 0.5);
      const h = s.get('6/4');
      expect(h?.amplitude).toBe(0.5);
    });
  });

  describe('has', () => {
    test('returns true for existing harmonic by Harmonic object', () => {
      const s = new Spectrum();
      const h = new Harmonic(200, 1);
      s.add(h);
      expect(s.has(h)).toBe(true);
    });

    test('returns true for existing harmonic by frequency', () => {
      const s = new Spectrum();
      s.add(200, 1);
      expect(s.has(200)).toBe(true);
    });

    test('returns false for non-existent harmonic', () => {
      const s = new Spectrum();
      s.add(100, 1);
      expect(s.has(200)).toBe(false);
    });

    test('finds harmonic using equivalent fraction', () => {
      const s = new Spectrum();
      s.add('3/2', 1);
      expect(s.has(1.5)).toBe(true);
    });
  });

  describe('remove', () => {
    test('removes existing harmonic by Harmonic object', () => {
      const s = new Spectrum();
      const h = new Harmonic(100, 1);
      s.add(h).add(200, 0.5)

      s.remove(h);

      expect(s.has(h)).toBe(false);
      expect(s.size).toBe(1);
      expect(s.has(200)).toBe(true);
    });

    test('removes existing harmonic by frequency', () => {
      const s = new Spectrum();
      s.add(100, 1).add(200, 0.5);

      s.remove(100);

      expect(s.size).toBe(1);
      expect(s.has(100)).toBe(false);
      expect(s.has(200)).toBe(true);
    });
  });

  describe('getHarmonics', () => {
    test('returns all harmonics as array, sorted by frequency', () => {
      const s = new Spectrum();
      s.add(2, 0.33);
      s.add(1, 1);
      s.add('3/2', 0.5);

      const harmonics = s.getHarmonics();
      expect(harmonics.length).toBe(3);
      expect(harmonics.every(h => h instanceof Harmonic)).toBe(true);
      // Should be sorted
      expect(harmonics[0]?.frequencyNum).toBe(1);
      expect(harmonics[1]?.frequencyNum).toBe(1.5);
      expect(harmonics[2]?.frequencyNum).toBe(2);
    });

    test('returns empty array for empty spectrum', () => {
      const s = new Spectrum();
      expect(s.getHarmonics()).toEqual([]);
    });
  });

  describe('getFrequenciesAsNumbers', () => {
    test('returns all frequencies as number array', () => {
      const s = new Spectrum();
      s.add(100, 1);
      s.add('200', 0.5);

      const freqs = s.getFrequenciesAsNumbers();
      expect(freqs.length).toBe(2);
      expect(freqs).toContain(100);
      expect(freqs).toContain(200);
    });
  });

  describe('size and isEmpty', () => {
    test('size returns correct count', () => {
      const s = new Spectrum();
      expect(s.size).toBe(0);
      s.add(100, 1);
      expect(s.size).toBe(1);
      s.add(200, 1);
      expect(s.size).toBe(2);
    });

    test('isEmpty returns true for empty spectrum', () => {
      const s = new Spectrum();
      expect(s.isEmpty()).toBe(true);
    });

    test('isEmpty returns false for non-empty spectrum', () => {
      const s = new Spectrum();
      s.add(100, 1);
      expect(s.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    test('removes all harmonics', () => {
      const s = new Spectrum();
      s.add(100, 1);
      s.add(200, 1);
      s.add(300, 1);

      s.clear();
      expect(s.size).toBe(0);
      expect(s.isEmpty()).toBe(true);
    });
  });

  describe('transpose', () => {
    test('transposes all harmonics by ratio', () => {
      const s = new Spectrum();
      s.add(100, 1);
      s.add(200, 0.5);

      s.transpose('3/2');

      expect(s.has(150)).toBe(true);
      expect(s.has(300)).toBe(true);
    });

    test('preserves amplitudes', () => {
      const s = new Spectrum();
      s.add(100, 0.8);
      s.transpose(2);

      const h = s.get(200);
      expect(h?.amplitude).toBe(0.8);
    });

    test('handles transpose by 1 (no change)', () => {
      const s = new Spectrum();
      s.add(100, 0.5);
      s.transpose(1);

      expect(s.has(100)).toBe(true);
    });

    test('handles fractional transpose', () => {
      const s = new Spectrum();
      s.add(200, 1);
      s.transpose('3/4');

      expect(s.has(150)).toBe(true);
    });

    test('throws error for non-positive ratio', () => {
      const s = new Spectrum();
      s.add(100, 1);
      expect(() => s.transpose(0)).toThrow('Ratio must be greater than 0');
      expect(() => s.transpose(-1)).toThrow('Ratio must be greater than 0');
    });
  });

  describe('toTransposed', () => {
    test('creates new transposed spectrum without modifying original', () => {
      const s1 = new Spectrum();
      s1.add(100, 1);
      s1.add(200, 0.5);

      const s2 = s1.toTransposed('3/2');

      expect(s1.has(100)).toBe(true);
      expect(s1.has(200)).toBe(true);
      expect(s2.has(150)).toBe(true);
      expect(s2.has(300)).toBe(true);
    });

    test('modyfying cope does not modify original', () => {
      const s1 = new Spectrum();
      s1.add(100, 1);
      s1.add(200, 0.5);

      const s2 = s1.toTransposed('1');
      s2.transpose('3/2');

      expect(s1.has(100)).toBe(true);
      expect(s1.has(200)).toBe(true);
      expect(s2.has(150)).toBe(true);
      expect(s2.has(300)).toBe(true);
    });
  });

  describe('scaleAmplitudes', () => {
    test('scales all amplitudes by factor', () => {
      const s = new Spectrum();
      s.add(100, 0.8);
      s.add(200, 0.4);

      s.scaleAmplitudes(0.5);

      expect(s.get(100)?.amplitude).toBe(0.4);
      expect(s.get(200)?.amplitude).toBe(0.2);
    });

    test('preserves frequencies', () => {
      const s = new Spectrum();
      s.add(100, 1);
      s.scaleAmplitudes(0.5);

      expect(s.has(100)).toBe(true);
    });
  });

  describe('getLowestHarmonic', () => {
    test('returns harmonic with lowest frequency', () => {
      const s = new Spectrum();
      s.add(200, 1);
      s.add(150, 1);
      s.add(300, 1);

      const lowest = s.getLowestHarmonic();
      expect(lowest?.frequencyStr).toBe("150");
    });

    test('returns undefined for empty spectrum', () => {
      const s = new Spectrum();
      expect(s.getLowestHarmonic()).toBeUndefined();
    });
  });

  describe('getHighestHarmonic', () => {
    test('returns harmonic with highest frequency', () => {
      const s = new Spectrum();
      s.add(100, 1);
      s.add(600, 1);
      s.add(300, 1);

      const highest = s.getHighestHarmonic();
      expect(highest?.frequencyNum).toBe(600);
    });

    test('returns undefined for empty spectrum', () => {
      const s = new Spectrum();
      expect(s.getHighestHarmonic()).toBeUndefined();
    });
  });

  describe('getPeriod', () => {
    test('calculates period from GCD', () => {
      const s = new Spectrum();
      s.add(100, 1);
      s.add(200, 1);
      s.add(300, 1);

      const period = s.getPeriod();
      expect(period?.toFraction()).toBe('1/100');
    });

    test('returns undefined for empty spectrum', () => {
      const s = new Spectrum();
      expect(s.getPeriod()).toBeUndefined();
    });
  });

  describe('clone', () => {
    test('creates independent copy', () => {
      const s1 = new Spectrum();
      s1.add(100, 0.8);
      s1.add(200, 0.5);

      const s2 = s1.clone();

      expect(s2.size).toBe(2);
      expect(s2.has(100)).toBe(true);
    });

    test('clone is independent of original', () => {
      const s1 = new Spectrum();
      s1.add(100, 1);

      const s2 = s1.clone();
      s2.add(200, 0.5);

      expect(s1.size).toBe(1);
      expect(s2.size).toBe(2);
    });

    test('harmonics in clone are independent', () => {
      const s1 = new Spectrum();
      s1.add(100, 0.5);

      const s2 = s1.clone();
      const h2 = s2.get(100);
      h2?.setAmplitude(0.8);

      expect(s1.get(100)?.amplitude).toBe(0.5);
    });
  });

  describe('forEach', () => {
    test('iterates over all harmonics', () => {
      const s = new Spectrum();
      s.add(100, 1);
      s.add(200, 0.5);

      const frequencies: string[] = [];
      s.forEach((h, key) => {
        frequencies.push(key);
      });

      expect(frequencies.length).toBe(2);
      expect(frequencies).toContain('100');
      expect(frequencies).toContain('200');
    });
  });

  describe('toJSON', () => {
    test('serializes spectrum to SpectrumData', () => {
      const s = new Spectrum();
      s.add(100, 0.8, 0);
      s.add(200, 0.5, 3.14);

      const json = s.toJSON();
      expect(json).toEqual([
        { frequency: { n: 100, d: 1 }, amplitude: 0.8, phase: 0 },
        { frequency: { n: 200, d: 1 }, amplitude: 0.5, phase: 3.14 }
      ]);
    });

    test('round-trip serialization', () => {
      const s1 = new Spectrum();
      s1.add(100, 0.8, 0);
      s1.add(200, 0.5, 3.14);

      const json = s1.toJSON();
      const s2 = new Spectrum(json);

      expect(s2.size).toBe(2);
      expect(s2.get(100)?.amplitude).toBe(0.8);
      expect(s2.get(200)?.amplitude).toBe(0.5);
    });
  });

  describe('edge cases', () => {
    test('handles large number of harmonics', () => {
      const s = new Spectrum();
      for (let i = 1; i <= 100; i++) {
        s.add(i, 1 / i);
      }
      expect(s.size).toBe(100);
    });

    test('handles very small amplitude values', () => {
      const s = new Spectrum();
      s.add(1, 0.000001);
      expect(s.get(1)?.amplitude).toBe(0.000001);
    });
  });
});

describe('Spectrum static methods', () => {
  describe('harmonic', () => {
    test('creates harmonic series with correct count', () => {
      const s = Spectrum.harmonic(5, 100);
      expect(s.size).toBe(5);
    });

    test('creates harmonics with correct frequencies as ratios', () => {
      const s = Spectrum.harmonic(3, 100);
      expect(s.has(100)).toBe(true);
      expect(s.has(200)).toBe(true);
      expect(s.has(300)).toBe(true);
    });

    test('applies natural amplitude decay (1/n)', () => {
      const s = Spectrum.harmonic(3, 100);
      expect(s.get(100)?.amplitude).toBe(1);
      expect(s.get(200)?.amplitude).toBe(0.5);
      expect(s.get(300)?.amplitude).toBeCloseTo(0.333, 2);
    });

    test('handles single harmonic', () => {
      const s = Spectrum.harmonic(1, 100);
      expect(s.size).toBe(1);
      expect(s.has(100)).toBe(true);
    });

    test('handles large count', () => {
      const s = Spectrum.harmonic(10000, 1);
      expect(s.size).toBe(10000);
      expect(s.has(10000)).toBe(true);
    });

    test('creates ratios correctly', () => {
      const s = Spectrum.harmonic(5, 100);
      const harmonics = s.getHarmonics();
      expect(harmonics[0]?.frequencyNum).toBe(100);
      expect(harmonics[1]?.frequencyNum).toBe(200);
      expect(harmonics[2]?.frequencyNum).toBe(300);
      expect(harmonics[3]?.frequencyNum).toBe(400);
      expect(harmonics[4]?.frequencyNum).toBe(500);
    });
  });

  describe('fromFrequencies', () => {
    test('creates spectrum from Fraction array', () => {
      const ratios = [new Fraction(100), new Fraction(200), new Fraction(300)];
      const s = Spectrum.fromFrequencies(ratios);

      expect(s.size).toBe(3);
      expect(s.has(200)).toBe(true);
    });

    test('creates spectrum from number array', () => {
      const s = Spectrum.fromFrequencies([100, 200, 300]);

      expect(s.size).toBe(3);
      expect(s.has('200')).toBe(true);
    });

    test('creates spectrum from string array', () => {
      const s = Spectrum.fromFrequencies(['100', '200', '300']);

      expect(s.size).toBe(3);
      expect(s.has('200')).toBe(true);
    });

    test('uses default amplitude of 1 when not provided', () => {
      const s = Spectrum.fromFrequencies([100, 200]);
      expect(s.get(100)?.amplitude).toBe(1);
      expect(s.get(200)?.amplitude).toBe(1);
    });

    test('uses provided amplitudes', () => {
      const s = Spectrum.fromFrequencies([100, 200], [0.8, 0.5]);
      expect(s.get(100)?.amplitude).toBe(0.8);
      expect(s.get(200)?.amplitude).toBe(0.5);
    });

    test('uses default phase of 0 when not provided', () => {
      const s = Spectrum.fromFrequencies([100, 200]);
      expect(s.get(100)?.phase).toBe(0);
    });

    test('uses provided phases', () => {
      const s = Spectrum.fromFrequencies([100, 200], [1, 1], [Math.PI, Math.PI / 2]);
      expect(s.get(100)?.phase).toBe(Math.PI);
      expect(s.get(200)?.phase).toBe(Math.PI / 2);
    });

    test('handles mixed input types', () => {
      const s = Spectrum.fromFrequencies([100, '200', new Fraction(300)]);
      expect(s.size).toBe(3);
      expect(s.has('100')).toBe(true);
      expect(s.has('200')).toBe(true);
      expect(s.has('300')).toBe(true);
    });

    test('handles empty array', () => {
      const s = Spectrum.fromFrequencies([]);
      expect(s.size).toBe(0);
    });

    test('handles partial amplitude array', () => {
      const s = Spectrum.fromFrequencies([100, 200, 300], [0.8]);
      expect(s.get(100)?.amplitude).toBe(0.8);
      expect(s.get(200)?.amplitude).toBe(1);
      expect(s.get(300)?.amplitude).toBe(1);
    });

    test('handles partial phase array', () => {
      const s = Spectrum.fromFrequencies([100, 200, 300], undefined, [Math.PI]);
      expect(s.get(100)?.phase).toBe(Math.PI);
      expect(s.get(200)?.phase).toBe(0);
      expect(s.get(300)?.phase).toBe(0);
    });
  });

  describe('integration tests', () => {
    test('can transpose factory-created spectrum', () => {
      const s = Spectrum.harmonic(3, 100);
      s.transpose('3/2');

      expect(s.has(100)).toBe(false);
      expect(s.has(150)).toBe(true);
    });

    test('can clone factory-created spectrum', () => {
      const s1 = Spectrum.harmonic(5, 100);
      const s2 = s1.clone();

      expect(s2.size).toBe(s1.size);
      expect(s2.has(100)).toBe(true);
      expect(s2.has(200)).toBe(true);
      expect(s2.has(300)).toBe(true);
      expect(s2.has(400)).toBe(true);
      expect(s2.has(500)).toBe(true);
    });

    test('can scale amplitudes', () => {
      const s = Spectrum.harmonic(2, 100);
      s.scaleAmplitudes(0.5);

      expect(s.get(100)?.amplitude).toBe(0.5);
      expect(s.get(200)?.amplitude).toBe(0.25);
    });
  });

  describe('edge cases', () => {
    test('harmonic with count 0 creates empty spectrum', () => {
      const s = Spectrum.harmonic(0, 100);
      expect(s.size).toBe(0);
    });

    test('fromFrequencies handles duplicate ratios', () => {
      const s = Spectrum.fromFrequencies([1, '3/2', 1.5], [0.8, 0.5, 0.6]);
      expect(s.size).toBe(2); // 1 and 3/2 (1.5 is duplicate)
      expect(s.get('3/2')?.amplitude).toBe(0.6); // Last one wins
    });

    test('large harmonic series is sorted correctly', () => {
      const s = Spectrum.harmonic(1, 10000);
      const sorted = s.getHarmonics();

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]?.compareFrequency(sorted[i - 1]!)).toBeGreaterThan(0);
      }
    });
  });

  describe('musical examples', () => {
    test('creates major triad', () => {
      const s = Spectrum.fromFrequencies([1, '5/4', '3/2'], [1, 1, 1]);
      expect(s.size).toBe(3);
      expect(s.has(1)).toBe(true);
      expect(s.has('5/4')).toBe(true);
      expect(s.has('3/2')).toBe(true);
    });

    test('creates minor triad', () => {
      const s = Spectrum.fromFrequencies([1, '6/5', '3/2']);
      expect(s.size).toBe(3);
      expect(s.has('6/5')).toBe(true);
    });
  });
});

import { describe, test, expect } from 'bun:test';
import Fraction from 'fraction.js';
import { IntervalSet } from './IntervalSet';

describe('IntervalSet', () => {
  describe('constructor', () => {
    test('creates empty set with no arguments', () => {
      const set = new IntervalSet();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    test('creates set from array of Fractions', () => {
      const set = new IntervalSet([
        new Fraction(1),
        new Fraction(3, 2),
        new Fraction(2),
      ]);
      expect(set.size).toBe(3);
    });

    test('creates set from array of numbers', () => {
      const set = new IntervalSet([1, 1.5, 2]);
      expect(set.size).toBe(3);
    });

    test('creates set from array of strings', () => {
      const set = new IntervalSet(['1', '3/2', '2']);
      expect(set.size).toBe(3);
    });

    test('creates set from mixed types', () => {
      const set = new IntervalSet([1, '3/2', new Fraction(2)]);
      expect(set.size).toBe(3);
    });

    test('handles duplicate ratios in constructor', () => {
      const set = new IntervalSet([1, '3/2', 1.5, new Fraction(3, 2)]);
      expect(set.size).toBe(2); // 1 and 3/2 (1.5 and Fraction(3,2) are duplicates)
    });

    test('simplifies fractions automatically', () => {
      const set = new IntervalSet(['6/4', '3/2']);
      expect(set.size).toBe(1); // Both simplify to 3/2
    });
  });

  describe('add', () => {
    test('adds Fraction to set', () => {
      const set = new IntervalSet();
      set.add(new Fraction(3, 2));
      expect(set.size).toBe(1);
      expect(set.has('3/2')).toBe(true);
    });

    test('adds number to set', () => {
      const set = new IntervalSet();
      set.add(1.5);
      expect(set.size).toBe(1);
      expect(set.has('3/2')).toBe(true);
    });

    test('adds string to set', () => {
      const set = new IntervalSet();
      set.add('5/4');
      expect(set.size).toBe(1);
      expect(set.has('5/4')).toBe(true);
    });

    test('replaces existing ratio', () => {
      const set = new IntervalSet(['3/2']);
      set.add(1.5); // Same ratio, different representation
      expect(set.size).toBe(1);
    });

    test('adds multiple distinct ratios', () => {
      const set = new IntervalSet();
      set.add(1);
      set.add('5/4');
      set.add('3/2');
      expect(set.size).toBe(3);
    });
  });

  describe('has', () => {
    test('returns true for existing ratio (Fraction)', () => {
      const set = new IntervalSet(['3/2']);
      expect(set.has(new Fraction(3, 2))).toBe(true);
    });

    test('returns true for existing ratio (number)', () => {
      const set = new IntervalSet(['3/2']);
      expect(set.has(1.5)).toBe(true);
    });

    test('returns true for existing ratio (string)', () => {
      const set = new IntervalSet([1.5]);
      expect(set.has('3/2')).toBe(true);
    });

    test('returns false for non-existent ratio', () => {
      const set = new IntervalSet([1, 2]);
      expect(set.has('3/2')).toBe(false);
    });

    test('handles equivalent fractions', () => {
      const set = new IntervalSet(['3/2']);
      expect(set.has('6/4')).toBe(true);
    });
  });

  describe('delete', () => {
    test('removes existing ratio', () => {
      const set = new IntervalSet([1, '3/2', 2]);
      const result = set.delete('3/2');
      expect(result).toBe(set); // Returns this for chaining
      expect(set.size).toBe(2);
      expect(set.has('3/2')).toBe(false);
    });

    test('returns this for chaining', () => {
      const set = new IntervalSet([1, 2]);
      const result = set.delete('3/2');
      expect(result).toBe(set);
      expect(set.size).toBe(2);
    });

    test('handles equivalent fractions', () => {
      const set = new IntervalSet(['3/2']);
      set.delete('6/4');
      expect(set.has('3/2')).toBe(false);
    });
  });

  describe('get', () => {
    test('retrieves existing ratio', () => {
      const set = new IntervalSet(['3/2']);
      const ratio = set.get('3/2');
      expect(ratio).toBeDefined();
      expect(ratio?.toFraction()).toBe('3/2');
    });

    test('returns undefined for non-existent ratio', () => {
      const set = new IntervalSet([1]);
      const ratio = set.get('3/2');
      expect(ratio).toBeUndefined();
    });

    test('handles equivalent fractions', () => {
      const set = new IntervalSet(['3/2']);
      const ratio = set.get(1.5);
      expect(ratio?.toFraction()).toBe('3/2');
    });
  });

  describe('size and isEmpty', () => {
    test('size returns correct count', () => {
      const set = new IntervalSet();
      expect(set.size).toBe(0);
      set.add(1);
      expect(set.size).toBe(1);
      set.add(2);
      expect(set.size).toBe(2);
    });

    test('isEmpty returns true for empty set', () => {
      const set = new IntervalSet();
      expect(set.isEmpty()).toBe(true);
    });

    test('isEmpty returns false for non-empty set', () => {
      const set = new IntervalSet([1]);
      expect(set.isEmpty()).toBe(false);
    });
  });

  describe('getRatios', () => {
    test('returns all ratios as array', () => {
      const set = new IntervalSet([1, '3/2', 2]);
      const ratios = set.getRatios();
      expect(ratios.length).toBe(3);
      expect(ratios.every(r => r instanceof Fraction)).toBe(true);
    });

    test('returns empty array for empty set', () => {
      const set = new IntervalSet();
      expect(set.getRatios()).toEqual([]);
    });

    test('returns ratios sorted in ascending order', () => {
      const set = new IntervalSet([2, '5/4', '3/2', 1]);
      const sorted = set.getRatios();

      expect(sorted[0]?.toFraction()).toBe('1');
      expect(sorted[1]?.toFraction()).toBe('5/4');
      expect(sorted[2]?.toFraction()).toBe('3/2');
      expect(sorted[3]?.toFraction()).toBe('2');
    });

    test('handles single ratio', () => {
      const set = new IntervalSet([1]);
      const sorted = set.getRatios();
      expect(sorted.length).toBe(1);
    });

    test('returns empty array for empty set', () => {
      const set = new IntervalSet();
      expect(set.getRatios()).toEqual([]);
    });

    test('returns ratio at index in sorted order', () => {
      const set = new IntervalSet([2, 1, '3/2']);
      const ratios = set.getRatios();
      expect(ratios[0]?.toFraction()).toBe('1');
      expect(ratios[1]?.toFraction()).toBe('3/2');
      expect(ratios[2]?.toFraction()).toBe('2');
    });

    test('returns undefined for out of bounds index', () => {
      const set = new IntervalSet([1, 2]);
      const ratios = set.getRatios();
      expect(ratios[5]).toBeUndefined();
      expect(ratios[-1]).toBeUndefined();
    });

    test('returns undefined for empty set', () => {
      const set = new IntervalSet();
      const ratios = set.getRatios();
      expect(ratios[0]).toBeUndefined();
    });
  });

  describe('min and max', () => {
    test('min returns smallest ratio', () => {
      const set = new IntervalSet([2, '5/4', '3/2']);
      const min = set.min();
      expect(min?.toFraction()).toBe('5/4');
    });

    test('max returns largest ratio', () => {
      const set = new IntervalSet(['5/4', 1, '3/2']);
      const max = set.max();
      expect(max?.toFraction()).toBe('3/2');
    });

    test('min returns undefined for empty set', () => {
      const set = new IntervalSet();
      expect(set.min()).toBeUndefined();
    });

    test('max returns undefined for empty set', () => {
      const set = new IntervalSet();
      expect(set.max()).toBeUndefined();
    });

    test('min and max work with single element', () => {
      const set = new IntervalSet(['3/2']);
      expect(set.min()?.toFraction()).toBe('3/2');
      expect(set.max()?.toFraction()).toBe('3/2');
    });
  });

  describe('clear', () => {
    test('removes all ratios', () => {
      const set = new IntervalSet([1, '3/2', 2]);
      set.clear();
      expect(set.size).toBe(0);
      expect(set.isEmpty()).toBe(true);
    });

    test('works on empty set', () => {
      const set = new IntervalSet();
      expect(() => set.clear()).not.toThrow();
      expect(set.size).toBe(0);
    });
  });

  describe('clone', () => {
    test('creates independent copy', () => {
      const set1 = new IntervalSet([1, '3/2', 2]);
      const set2 = set1.clone();

      expect(set2.size).toBe(set1.size);
      expect(set2.equals(set1)).toBe(true);
    });

    test('clone is independent from original', () => {
      const set1 = new IntervalSet([1, '3/2']);
      const set2 = set1.clone();

      set2.add(2);

      expect(set1.size).toBe(2);
      expect(set2.size).toBe(3);
    });

    test('clones empty set', () => {
      const set1 = new IntervalSet();
      const set2 = set1.clone();
      expect(set2.size).toBe(0);
    });
  });

  describe('forEach', () => {
    test('iterates over all ratios', () => {
      const set = new IntervalSet([1, '3/2']);
      const keys: string[] = [];

      set.forEach((ratio: Fraction, key: string) => {
        keys.push(key);
      });

      expect(keys.length).toBe(2);
      expect(keys).toContain('1');
      expect(keys).toContain('3/2');
    });

    test('provides Fraction objects in callback', () => {
      const set = new IntervalSet(['5/4']);

      set.forEach((ratio: Fraction) => {
        expect(ratio).toBeInstanceOf(Fraction);
        expect(ratio.toFraction()).toBe('5/4');
      });
    });
  });

  describe('toSpectrum', () => {
    test('converts to spectrum with amplitude function', () => {
      const set = new IntervalSet([1, '3/2', 2]);
      const spectrum = set.toSpectrum((ratio: Fraction, index: number) => {
        return 1 / (index + 1);
      });

      expect(spectrum.size).toBe(3);
      expect(spectrum.get(1)?.amplitude).toBe(1);
      expect(spectrum.get('3/2')?.amplitude).toBe(0.5);
      expect(spectrum.get(2)?.amplitude).toBeCloseTo(0.333, 3);
    });

    test('converts to spectrum with constant amplitude', () => {
      const set = new IntervalSet([1, 2]);
      const spectrum = set.toSpectrum(() => 0.5);

      expect(spectrum.get(1)?.amplitude).toBe(0.5);
      expect(spectrum.get(2)?.amplitude).toBe(0.5);
    });

    test('converts ratios to frequencies in spectrum', () => {
      const set = new IntervalSet([1, '3/2', 2]);
      const spectrum = set.toSpectrum(() => 1);

      const frequencies = spectrum.getFrequenciesAsNumbers();
      expect(frequencies).toEqual([1, 1.5, 2]);
    });

    test('handles empty set', () => {
      const set = new IntervalSet();
      const spectrum = set.toSpectrum(() => 1);
      expect(spectrum.size).toBe(0);
    });
  });

  describe('toStrings', () => {
    test('returns sorted array of fraction strings', () => {
      const set = new IntervalSet([2, 1, '3/2']);
      const strings = set.toStrings();

      expect(strings).toEqual(['1', '3/2', '2']);
    });

    test('returns empty array for empty set', () => {
      const set = new IntervalSet();
      expect(set.toStrings()).toEqual([]);
    });
  });

  describe('toNumbers', () => {
    test('returns sorted array of decimal numbers', () => {
      const set = new IntervalSet([2, 1, '3/2']);
      const numbers = set.toNumbers();

      expect(numbers).toEqual([1, 1.5, 2]);
    });

    test('returns empty array for empty set', () => {
      const set = new IntervalSet();
      expect(set.toNumbers()).toEqual([]);
    });

    test('converts complex fractions to decimals', () => {
      const set = new IntervalSet(['5/4', '7/4']);
      const numbers = set.toNumbers();

      expect(numbers[0]).toBe(1.25);
      expect(numbers[1]).toBe(1.75);
    });
  });

  describe('equals', () => {
    test('returns true for equal sets', () => {
      const set1 = new IntervalSet([1, '3/2', 2]);
      const set2 = new IntervalSet([1, '3/2', 2]);

      expect(set1.equals(set2)).toBe(true);
    });

    test('returns true regardless of insertion order', () => {
      const set1 = new IntervalSet([1, '3/2', 2]);
      const set2 = new IntervalSet([2, 1, '3/2']);

      expect(set1.equals(set2)).toBe(true);
    });

    test('returns false for sets with different sizes', () => {
      const set1 = new IntervalSet([1, '3/2']);
      const set2 = new IntervalSet([1, '3/2', 2]);

      expect(set1.equals(set2)).toBe(false);
    });

    test('returns false for sets with different ratios', () => {
      const set1 = new IntervalSet([1, '3/2']);
      const set2 = new IntervalSet([1, '5/4']);

      expect(set1.equals(set2)).toBe(false);
    });

    test('handles equivalent fractions', () => {
      const set1 = new IntervalSet(['3/2']);
      const set2 = new IntervalSet(['6/4']);

      expect(set1.equals(set2)).toBe(true);
    });

    test('returns true for empty sets', () => {
      const set1 = new IntervalSet();
      const set2 = new IntervalSet();

      expect(set1.equals(set2)).toBe(true);
    });
  });


  describe('edge cases', () => {
    test('handles very small ratios', () => {
      const set = new IntervalSet(['1/1000']);
      expect(set.has('1/1000')).toBe(true);
      expect(set.getRatios()[0]?.valueOf()).toBe(0.001);
    });

    test('handles very large ratios', () => {
      const set = new IntervalSet(['1000/1']);
      expect(set.has(1000)).toBe(true);
    });

    test('handles many ratios', () => {
      const ratios: number[] = [];
      for (let i = 1; i <= 100; i++) {
        ratios.push(i);
      }
      const set = new IntervalSet(ratios);
      expect(set.size).toBe(100);
    });

    test('handles irrational approximations', () => {
      const set = new IntervalSet([Math.PI]);
      const ratio = set.getRatios()[0];
      expect(ratio?.valueOf()).toBeCloseTo(Math.PI, 5);
    });
  });

  describe('IntervalSet static mathods', () => {
    describe('range', () => {
      test('generates ratios between 1 and 2 with denominator limit', () => {
        const set = IntervalSet.range(1, 2, 5);

        expect(set.size).toBeGreaterThan(0);
        expect(set.has(1)).toBe(true);
        expect(set.has(2)).toBe(true);

        // Should include simple ratios like 5/4, 4/3, 3/2
        expect(set.has('5/4')).toBe(true);
        expect(set.has('4/3')).toBe(true);
        expect(set.has('3/2')).toBe(true);
      });

      test('respects minimum bound', () => {
        const set = IntervalSet.range(1.5, 2, 10);
        const ratios = set.toNumbers();

        expect(ratios.every(r => r >= 1.5)).toBe(true);
        expect(set.has(1)).toBe(false);
        expect(set.has('5/4')).toBe(false);
      });

      test('respects maximum bound', () => {
        const set = IntervalSet.range(1, 1.5, 10);
        const ratios = set.toNumbers();

        expect(ratios.every(r => r <= 1.5)).toBe(true);
        expect(set.has(2)).toBe(false);
      });

      test('includes boundary values', () => {
        const set = IntervalSet.range(1, 2, 5);

        expect(set.has(1)).toBe(true);
        expect(set.has(2)).toBe(true);
      });

      test('higher denominator limit produces more ratios', () => {
        const set1 = IntervalSet.range(1, 2, 5);
        const set2 = IntervalSet.range(1, 2, 10);

        expect(set2.size).toBeGreaterThan(set1.size);
      });

      test('generates all ratios with denominator 1', () => {
        const set = IntervalSet.range(1, 3, 1);

        expect(set.size).toBe(3); // 1/1, 2/1, 3/1
        expect(set.has(1)).toBe(true);
        expect(set.has(2)).toBe(true);
        expect(set.has(3)).toBe(true);
      });

      test('handles fractional bounds (Fraction)', () => {
        const set = IntervalSet.range(new Fraction(1), new Fraction(2), 8);

        expect(set.has(1)).toBe(true);
        expect(set.has(2)).toBe(true);
        expect(set.size).toBeGreaterThan(0);
      });

      test('handles fractional bounds (string)', () => {
        const set = IntervalSet.range('1', '2', 8);

        expect(set.has(1)).toBe(true);
        expect(set.has(2)).toBe(true);
      });

      test('handles non-integer bounds', () => {
        const set = IntervalSet.range('5/4', '3/2', 6);

        expect(set.has('5/4')).toBe(true);
        expect(set.has('3/2')).toBe(true);
        expect(set.has(1)).toBe(false);
        expect(set.has(2)).toBe(false);
      });

      test('generates single ratio when min equals max', () => {
        const set = IntervalSet.range(1, 1, 10);

        expect(set.size).toBe(1);
        expect(set.has(1)).toBe(true);
      });

      test('throws error when min > max', () => {
        expect(() => IntervalSet.range(2, 1, 5)).toThrow('min must be less than or equal to max');
      });

      test('throws error for maxDenominator < 1', () => {
        expect(() => IntervalSet.range(1, 2, 0)).toThrow('maxDenominator must be at least 1');
        expect(() => IntervalSet.range(1, 2, -5)).toThrow('maxDenominator must be at least 1');
      });

      test('automatically simplifies fractions', () => {
        const set = IntervalSet.range(1, 2, 10);

        // 6/4 should be simplified to 3/2, so only one entry
        const count3_2 = set.getRatios().filter(r => r.toFraction() === '3/2').length;
        expect(count3_2).toBe(1);
      });

      test.only('handles large denominator limits', () => {
        const set = IntervalSet.range(1, 2, 100);

        expect(set.size).toEqual(3045); // Many ratios
        expect(set.has('199/100')).toBe(true);
        expect(set.has('100/100')).toBe(true); // Simplifies to 1
      });

      test('generates correct ratios for octave with limit 5', () => {
        const set = IntervalSet.range(1, 2, 5);

        // Should include these common ratios
        expect(set.has('6/5')).toBe(true);  // Minor third
        expect(set.has('5/4')).toBe(true);  // Major third
        expect(set.has('4/3')).toBe(true);  // Perfect fourth
        expect(set.has('3/2')).toBe(true);  // Perfect fifth
        expect(set.has('8/5')).toBe(true);  // Minor sixth
        expect(set.has('5/3')).toBe(true);  // Major sixth
      });

      test('all generated ratios are within bounds', () => {
        const set = IntervalSet.range(1, 2, 20);
        const ratios = set.toNumbers();

        expect(ratios.every(r => r >= 1 && r <= 2)).toBe(true);
      });

      test('handles very small ranges', () => {
        const set = IntervalSet.range(1, '101/100', 100);

        expect(set.size).toBeGreaterThan(0);
        expect(set.min()?.compare(1)).toBeGreaterThanOrEqual(0);
        expect(set.max()?.compare(new Fraction(101, 100))).toBeLessThanOrEqual(0);
      });

      test('generates ratios across multiple octaves', () => {
        const set = IntervalSet.range(1, 4, 5);

        expect(set.has(1)).toBe(true);
        expect(set.has(2)).toBe(true);
        expect(set.has(3)).toBe(true);
        expect(set.has(4)).toBe(true);
      });

      test('fine divisions for 100-step octave', () => {
        const set = IntervalSet.range(1, 2, 100);

        // Should have many fine divisions
        expect(set.size).toBeGreaterThan(100);

        // Check it includes some specific cents-like divisions
        expect(set.has('100/99')).toBe(true);
        expect(set.has('99/98')).toBe(true);
      });
    });

    describe('musical examples', () => {
      test('generates 5-limit just intonation intervals', () => {
        const set = IntervalSet.range(1, 2, 5);

        // 5-limit intervals in one octave
        expect(set.has('6/5')).toBe(true);   // Minor third
        expect(set.has('5/4')).toBe(true);   // Major third
        expect(set.has('4/3')).toBe(true);   // Perfect fourth
        expect(set.has('3/2')).toBe(true);   // Perfect fifth
        expect(set.has('8/5')).toBe(true);   // Minor sixth
        expect(set.has('5/3')).toBe(true);   // Major sixth
        expect(set.has('9/5')).toBe(true);   // Minor seventh
      });

      test('generates 7-limit intervals', () => {
        const set = IntervalSet.range(1, 2, 7);

        expect(set.has('7/4')).toBe(true);   // Harmonic seventh
        expect(set.has('7/5')).toBe(true);   // Tritone
        expect(set.has('7/6')).toBe(true);   // Septimal minor third
      });
    });

    describe('edge cases and validation', () => {
      test('handles maxDenominator of 1', () => {
        const set = IntervalSet.range(1, 5, 1);

        // Should only include integers
        expect(set.toStrings()).toEqual(['1', '2', '3', '4', '5']);
      });

      test('handles very large ranges', () => {
        const set = IntervalSet.range(0.25, 10, 5);

        expect(set.size).toBeGreaterThan(10);
        expect(set.has(0.25)).toBe(true);
        expect(set.has(10)).toBe(true);
      });

      test('all ratios respect denominator limit', () => {
        const maxDenom = 7;
        const set = IntervalSet.range(1, 2, maxDenom);

        // Check that all ratios have denominators <= maxDenom (after simplification)
        set.forEach(ratio => {
          expect(ratio.d).toBeLessThanOrEqual(maxDenom);
        });
      });

      test('handles irrational bounds approximated as fractions', () => {
        const set = IntervalSet.range(1, Math.PI, 10);

        expect(set.size).toBeGreaterThan(0);
        expect(set.max()?.valueOf()).toBeLessThanOrEqual(Math.PI);
      });

      test('consistent results for equivalent bound representations', () => {
        const set1 = IntervalSet.range(1, 2, 8);
        const set2 = IntervalSet.range('1', '2', 8);
        const set3 = IntervalSet.range(new Fraction(1), new Fraction(2), 8);

        expect(set1.equals(set2)).toBe(true);
        expect(set2.equals(set3)).toBe(true);
      });

      test('handles bounds with complex fractions', () => {
        const set = IntervalSet.range('7/6', '11/6', 12);

        expect(set.has('7/6')).toBe(true);
        expect(set.has('11/6')).toBe(true);
        expect(set.min()?.toFraction()).toBe('7/6');
        expect(set.max()?.toFraction()).toBe('11/6');
      });
    });

    describe('performance considerations', () => {
      test('handles reasonable large denominator limits efficiently', () => {
        const startTime = Date.now();
        const set = IntervalSet.range(1, 2, 100);
        const endTime = Date.now();

        expect(set.size).toBeGreaterThan(0);
        expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      });

      test('deduplication works correctly', () => {
        const set = IntervalSet.range(1, 2, 20);

        // Count how many times we'd see 3/2 if we didn't deduplicate
        // (e.g., 3/2, 6/4, 9/6, 12/8, 15/10, 18/12 all simplify to 3/2)
        // But the set should only have one
        const count = set.getRatios().filter(r => r.toFraction() === '3/2').length;
        expect(count).toBe(1);
      });
    });
  });
});

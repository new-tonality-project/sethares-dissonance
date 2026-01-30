import { describe, test, expect } from 'bun:test';
import Fraction from 'fraction.js';
import { Harmonic } from './Harmonic';

describe('Harmonic', () => {
  describe('constructor', () => {
    test('creates harmonic with Fraction', () => {
      const h = new Harmonic(new Fraction(3, 2), 0.5, Math.PI);
      expect(h.frequencyStr).toBe('3/2');
      expect(h.amplitude).toBe(0.5);
      expect(h.phase).toBe(Math.PI);
    });

    test('creates harmonic with number', () => {
      const h = new Harmonic(1.5, 0.5);
      expect(h.frequencyNum).toBe(1.5);
      expect(h.amplitude).toBe(0.5);
      expect(h.phase).toBe(0);
    });

    test('creates harmonic with fraction string', () => {
      const h = new Harmonic('3/2', 0.8);
      expect(h.frequencyStr).toBe('3/2');
      expect(h.amplitude).toBe(0.8);
    });

    test('uses default amplitude of 1', () => {
      const h = new Harmonic(1);
      expect(h.amplitude).toBe(1);
    });

    test('uses default phase of 0', () => {
      const h = new Harmonic(1, 0.5);
      expect(h.phase).toBe(0);
    });

    test('throws error for zero frequency', () => {
      expect(() => new Harmonic(0, 1)).toThrow('Frequency must be positive');
    });

    test('throws error for negative frequency', () => {
      expect(() => new Harmonic(-1, 1)).toThrow('Frequency must be positive');
    });

    test('throws error for amplitude < 0', () => {
      expect(() => new Harmonic(1, -0.1)).toThrow('Amplitude must be between 0 and 1');
    });

    test('throws error for amplitude > 1', () => {
      expect(() => new Harmonic(1, 1.1)).toThrow('Amplitude must be between 0 and 1');
    });

    test('throws error for phase < 0', () => {
      expect(() => new Harmonic(1, 1, -0.1)).toThrow('Phase must be between 0 and 2π');
    });

    test('throws error for phase >= 2π', () => {
      expect(() => new Harmonic(1, 1, 2 * Math.PI)).toThrow('Phase must be between 0 and 2π');
    });

    test('allows phase exactly at 0', () => {
      const h = new Harmonic(1, 1, 0);
      expect(h.phase).toBe(0);
    });

    test('allows phase just below 2π', () => {
      const phase = 2 * Math.PI - 0.0001;
      const h = new Harmonic(1, 1, phase);
      expect(h.phase).toBe(phase);
    });

    test('creates harmonic with HarmonicData object', () => {
      const data = {
        frequency: { n: 3, d: 2 },
        amplitude: 0.5,
        phase: Math.PI,
      };
      const h = new Harmonic(data);
      expect(h.frequencyStr).toBe('3/2');
      expect(h.amplitude).toBe(0.5);
      expect(h.phase).toBe(Math.PI);
    });

    test('creates harmonic with HarmonicData using Fraction format', () => {
      const data = {
        frequency: { n: 1761, d: 4 }, // 440.25
        amplitude: 0.8,
        phase: 0,
      };
      const h = new Harmonic(data);
      expect(h.frequencyNum).toBe(440.25);
      expect(h.amplitude).toBe(0.8);
      expect(h.phase).toBe(0);
    });
  });

  describe('setFrequency', () => {
    test('updates frequency with Fraction', () => {
      const h = new Harmonic(1, 1);
      h.setFrequency(new Fraction(5, 4));
      expect(h.frequencyStr).toBe('5/4');
    });

    test('updates frequency with number', () => {
      const h = new Harmonic(1, 1);
      h.setFrequency(2.5);
      expect(h.frequencyNum).toBe(2.5);
    });

    test('updates frequency with string', () => {
      const h = new Harmonic(1, 1);
      h.setFrequency('7/4');
      expect(h.frequencyStr).toBe('7/4');
    });

    test('throws error for zero frequency', () => {
      const h = new Harmonic(1, 1);
      expect(() => h.setFrequency(0)).toThrow('Frequency must be positive');
    });

    test('throws error for negative frequency', () => {
      const h = new Harmonic(1, 1);
      expect(() => h.setFrequency(-1)).toThrow('Frequency must be positive');
    });

    test('returns this for method chaining', () => {
      const h = new Harmonic(1, 1);
      const result = h.setFrequency('3/2');
      expect(result).toBe(h);
      expect(h.frequencyStr).toBe('3/2');
    });
  });

  describe('setAmplitude', () => {
    test('updates amplitude', () => {
      const h = new Harmonic(1, 0.5);
      h.setAmplitude(0.8);
      expect(h.amplitude).toBe(0.8);
    });

    test('allows amplitude of 0', () => {
      const h = new Harmonic(1, 1);
      h.setAmplitude(0);
      expect(h.amplitude).toBe(0);
    });

    test('allows amplitude of 1', () => {
      const h = new Harmonic(1, 0.5);
      h.setAmplitude(1);
      expect(h.amplitude).toBe(1);
    });

    test('throws error for negative amplitude', () => {
      const h = new Harmonic(1, 1);
      expect(() => h.setAmplitude(-0.1)).toThrow('Amplitude must be between 0 and 1');
    });

    test('throws error for amplitude > 1', () => {
      const h = new Harmonic(1, 1);
      expect(() => h.setAmplitude(1.5)).toThrow('Amplitude must be between 0 and 1');
    });

    test('returns this for method chaining', () => {
      const h = new Harmonic(1, 0.5);
      const result = h.setAmplitude(0.8);
      expect(result).toBe(h);
      expect(h.amplitude).toBe(0.8);
    });
  });

  describe('setPhase', () => {
    test('updates phase', () => {
      const h = new Harmonic(1, 1, 0);
      h.setPhase(Math.PI);
      expect(h.phase).toBe(Math.PI);
    });

    test('allows phase of 0', () => {
      const h = new Harmonic(1, 1, Math.PI);
      h.setPhase(0);
      expect(h.phase).toBe(0);
    });

    test('throws error for negative phase', () => {
      const h = new Harmonic(1, 1);
      expect(() => h.setPhase(-0.1)).toThrow('Phase must be between 0 and 2π');
    });

    test('throws error for phase >= 2π', () => {
      const h = new Harmonic(1, 1);
      expect(() => h.setPhase(2 * Math.PI)).toThrow('Phase must be between 0 and 2π');
    });

    test('returns this for method chaining', () => {
      const h = new Harmonic(1, 1, 0);
      const result = h.setPhase(Math.PI);
      expect(result).toBe(h);
      expect(h.phase).toBe(Math.PI);
    });
  });

  describe('transpose', () => {
    test('multiplies frequency by ratio (Fraction)', () => {
      const h = new Harmonic(1, 1);
      h.transpose(new Fraction(3, 2));
      expect(h.frequencyStr).toBe('3/2');
    });

    test('multiplies frequency by ratio (number)', () => {
      const h = new Harmonic(2, 1);
      h.transpose(1.5);
      expect(h.frequencyNum).toBe(3);
    });

    test('multiplies frequency by ratio (string)', () => {
      const h = new Harmonic('4/3', 1);
      h.transpose('3/2');
      expect(h.frequencyStr).toBe('2');
    });

    test('preserves amplitude and phase', () => {
      const h = new Harmonic(1, 0.5, Math.PI / 2);
      h.transpose(2);
      expect(h.amplitude).toBe(0.5);
      expect(h.phase).toBe(Math.PI / 2);
    });

    test('chains multiple transpositions correctly', () => {
      const h = new Harmonic(1, 1);
      h.transpose('3/2');
      h.transpose('4/3');
      expect(h.frequencyStr).toBe('2');
    });

    test('returns this for method chaining', () => {
      const h = new Harmonic(1, 1);
      const result = h.transpose('3/2');
      expect(result).toBe(h);
      expect(h.frequencyStr).toBe('3/2');
    });
  });

  describe('toTransposed', () => {
    test('creates transposed copy without modifying original', () => {
      const h1 = new Harmonic(1, 1);
      const h2 = h1.toTransposed('3/2');
      
      expect(h1.frequencyStr).toBe('1');
      expect(h2.frequencyStr).toBe('3/2');
      expect(h2).not.toBe(h1);
    });

    test('preserves amplitude and phase', () => {
      const h1 = new Harmonic(1, 0.5, Math.PI);
      const h2 = h1.toTransposed(2);
      
      expect(h2.amplitude).toBe(0.5);
      expect(h2.phase).toBe(Math.PI);
    });

    test('toTransposed is independent of original', () => {
      const h1 = new Harmonic(1, 0.5);
      const h2 = h1.toTransposed('3/2');

      h2.setAmplitude(0.8);
      h2.transpose(2);
      h2.setPhase(Math.PI);

      expect(h1.amplitude).toBe(0.5);
      expect(h1.frequencyNum).toBe(1);
      expect(h1.phase).toBe(0);
    });
  });

  describe('scale', () => {
    test('multiplies amplitude by factor', () => {
      const h = new Harmonic(1, 0.8);
      h.scale(0.5);
      expect(h.amplitude).toBe(0.4);
    });

    test('clamps to 0 if result is negative', () => {
      const h = new Harmonic(1, 0.5);
      h.scale(-2);
      expect(h.amplitude).toBe(0);
    });

    test('clamps to 1 if result > 1', () => {
      const h = new Harmonic(1, 0.8);
      h.scale(2);
      expect(h.amplitude).toBe(1);
    });

    test('allows scaling to exactly 0', () => {
      const h = new Harmonic(1, 1);
      h.scale(0);
      expect(h.amplitude).toBe(0);
    });

    test('preserves frequency and phase', () => {
      const h = new Harmonic('3/2', 0.5, Math.PI);
      h.scale(0.5);
      expect(h.frequencyStr).toBe('3/2');
      expect(h.phase).toBe(Math.PI);
    });

    test('returns this for method chaining', () => {
      const h = new Harmonic(1, 0.8);
      const result = h.scale(0.5);
      expect(result).toBe(h);
      expect(h.amplitude).toBe(0.4);
    });
  });

  describe('frequency getter', () => {
    test('returns Fraction object', () => {
      const h = new Harmonic('3/2', 1);
      const fraction = h.frequency;
      expect(fraction.toFraction()).toBe('3/2');
      expect(fraction.valueOf()).toBe(1.5);
    });

    test('returns Fraction for whole number', () => {
      const h = new Harmonic(2, 1);
      const fraction = h.frequency;
      expect(fraction.toFraction()).toBe('2');
      expect(fraction.valueOf()).toBe(2);
    });

    test('handles complex fractions', () => {
      const h = new Harmonic('7/4', 1);
      const fraction = h.frequency;
      expect(fraction.toFraction()).toBe('7/4');
      expect(fraction.valueOf()).toBe(1.75);
    });
  });

  describe('frequencyNum getter', () => {
    test('returns numeric value', () => {
      const h = new Harmonic('3/2', 1);
      expect(h.frequencyNum).toBe(1.5);
    });

    test('returns integer for whole numbers', () => {
      const h = new Harmonic(2, 1);
      expect(h.frequencyNum).toBe(2);
    });

    test('handles decimal input', () => {
      const h = new Harmonic(1.5, 1);
      expect(h.frequencyNum).toBe(1.5);
    });
  });

  describe('frequencyStr getter', () => {
    test('returns simplified fraction string', () => {
      const h = new Harmonic('6/4', 1);
      expect(h.frequencyStr).toBe('3/2');
    });

    test('returns integer for whole numbers', () => {
      const h = new Harmonic(2, 1);
      expect(h.frequencyStr).toBe('2');
    });

    test('handles decimal input', () => {
      const h = new Harmonic(1.5, 1);
      expect(h.frequencyStr).toBe('3/2');
    });
  });

  describe('clone', () => {
    test('creates independent copy', () => {
      const h1 = new Harmonic('3/2', 0.5, Math.PI / 2);
      const h2 = h1.clone();

      expect(h2.frequencyStr).toBe(h1.frequencyStr);
      expect(h2.amplitude).toBe(h1.amplitude);
      expect(h2.phase).toBe(h1.phase);
    });

    test('clone is independent of original', () => {
      const h1 = new Harmonic(1, 0.5);
      const h2 = h1.clone();

      h2.setAmplitude(0.8);
      h2.transpose(2);
      h2.setPhase(Math.PI);

      expect(h1.amplitude).toBe(0.5);
      expect(h1.frequencyNum).toBe(1);
      expect(h1.phase).toBe(0);
    });
  });

  describe('compareFrequency', () => {
    test('returns negative when this < other', () => {
      const h1 = new Harmonic(1, 1);
      const h2 = new Harmonic(2, 1);
      expect(h1.compareFrequency(h2)).toBeLessThan(0);
    });

    test('returns positive when this > other', () => {
      const h1 = new Harmonic(2, 1);
      const h2 = new Harmonic(1, 1);
      expect(h1.compareFrequency(h2)).toBeGreaterThan(0);
    });

    test('returns 0 when frequencies are equal', () => {
      const h1 = new Harmonic('3/2', 1);
      const h2 = new Harmonic(1.5, 1);
      expect(h1.compareFrequency(h2)).toBe(0);
    });

    test('handles fraction comparison correctly', () => {
      const h1 = new Harmonic('5/4', 1);
      const h2 = new Harmonic('4/3', 1);
      expect(h1.compareFrequency(h2)).toBeLessThan(0); // 5/4 < 4/3
    });
  });

  describe('toJSON', () => {
    test('serializes harmonic to HarmonicData object', () => {
      const h = new Harmonic('3/2', 0.5, Math.PI);
      const data = h.toJSON();
      
      expect(data.frequency).toEqual({ n: 3, d: 2 });
      expect(data.amplitude).toBe(0.5);
      expect(data.phase).toBe(Math.PI);
    });

    test('serializes whole number frequency', () => {
      const h = new Harmonic(2, 0.8, 0);
      const data = h.toJSON();
      
      expect(data.frequency).toEqual({ n: 2, d: 1 });
      expect(data.amplitude).toBe(0.8);
      expect(data.phase).toBe(0);
    });

    test('can be used to recreate harmonic', () => {
      const h1 = new Harmonic('5/4', 0.7, 1.5);
      const data = h1.toJSON();
      const h2 = new Harmonic(data);
      
      expect(h2.frequencyStr).toBe(h1.frequencyStr);
      expect(h2.amplitude).toBe(h1.amplitude);
      expect(h2.phase).toBe(h1.phase);
    });
  });

  describe('edge cases', () => {
    test('handles very small fractions', () => {
      const h = new Harmonic('1/1000', 0.5);
      expect(h.frequencyNum).toBe(0.001);
    });

    test('handles very large fractions', () => {
      const h = new Harmonic('100000/1', 0.5);
      expect(h.frequencyNum).toBe(100000);
    });

    test('handles irrational numbers (approximated)', () => {
      const h = new Harmonic(Math.PI, 0.5);
      expect(h.frequencyNum).toBeCloseTo(Math.PI, 10);
    });

    test('handles amplitude at boundaries', () => {
      const h1 = new Harmonic(1, 0);
      const h2 = new Harmonic(1, 1);
      expect(h1.amplitude).toBe(0);
      expect(h2.amplitude).toBe(1);
    });

    test('handles phase near boundaries', () => {
      const phase = 2 * Math.PI - 0.000001;
      const h = new Harmonic(1, 1, phase);
      expect(h.phase).toBeCloseTo(phase, 6);
    });
  });

  describe('method chaining', () => {
    test('can chain multiple setter methods', () => {
      const h = new Harmonic(1, 1)
        .setFrequency('3/2')
        .setAmplitude(0.8)
        .setPhase(Math.PI / 2);
      
      expect(h.frequencyStr).toBe('3/2');
      expect(h.amplitude).toBe(0.8);
      expect(h.phase).toBe(Math.PI / 2);
    });

    test('can chain transpose and scale', () => {
      const h = new Harmonic(1, 0.5)
        .transpose('3/2')
        .scale(0.8);
      
      expect(h.frequencyStr).toBe('3/2');
      expect(h.amplitude).toBe(0.4);
    });

    test('can chain all mutator methods', () => {
      const h = new Harmonic(1, 1)
        .setFrequency('5/4')
        .setAmplitude(0.7)
        .setPhase(Math.PI)
        .transpose('4/3')
        .scale(0.9);
      
      expect(h.frequencyStr).toBe('5/3');
      expect(h.amplitude).toBeCloseTo(0.63);
      expect(h.phase).toBe(Math.PI);
    });
  });
});

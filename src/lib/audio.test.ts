import { describe, it, expect } from 'vitest';
import { softClipCurve } from './audio';

// The master safety clamp. Its whole point is that it does nothing at all to
// ordinary playing — a compressor sitting here ducked the mix on every chord
// attack — and only bends a genuine overshoot away from the DAC's hard edge.
describe('softClipCurve', () => {
  const knee = 0.8;
  const curve = softClipCurve(2048, knee);
  const xs = Array.from(curve, (_, i) => (i / (curve.length - 1)) * 2 - 1);

  it('passes everything below the knee through untouched', () => {
    xs.forEach((x, i) => {
      // Exact identity, to the only precision a Float32Array curve can hold.
      if (Math.abs(x) <= knee) expect(curve[i], `x=${x}`).toBe(Math.fround(x));
    });
  });

  it('never reaches full scale, so nothing can hard-clip at the DAC', () => {
    curve.forEach((y, i) => {
      expect(Math.abs(y), `x=${xs[i]}`).toBeLessThan(1);
    });
  });

  it('compresses above the knee rather than passing or flattening it', () => {
    xs.forEach((x, i) => {
      if (Math.abs(x) > knee) {
        expect(Math.abs(curve[i]), `x=${x}`).toBeLessThan(Math.abs(x));   // bent down
        expect(Math.abs(curve[i]), `x=${x}`).toBeGreaterThan(knee);       // still moving
      }
    });
  });

  it('rises monotonically, so the waveform keeps its shape', () => {
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i], `at index ${i}`).toBeGreaterThanOrEqual(curve[i - 1]);
    }
  });

  it('is odd-symmetric, so it adds no DC offset', () => {
    for (let i = 0; i < curve.length; i++) {
      expect(curve[i]).toBeCloseTo(-curve[curve.length - 1 - i], 12);
    }
  });

  it('is continuous — no step at the knee to click on', () => {
    for (let i = 1; i < curve.length; i++) {
      expect(Math.abs(curve[i] - curve[i - 1])).toBeLessThan(0.01);
    }
  });
});

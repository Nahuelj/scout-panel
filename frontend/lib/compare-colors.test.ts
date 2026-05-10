import { COMPARE_SLOT_COLORS, getSlotColor } from './compare-colors';

describe('getSlotColor', () => {
  it('returns the color at the requested index', () => {
    expect(getSlotColor(0)).toBe(COMPARE_SLOT_COLORS[0]);
    expect(getSlotColor(1)).toBe(COMPARE_SLOT_COLORS[1]);
    expect(getSlotColor(2)).toBe(COMPARE_SLOT_COLORS[2]);
  });

  it('falls back to the first color when out of range', () => {
    expect(getSlotColor(99)).toBe(COMPARE_SLOT_COLORS[0]);
    expect(getSlotColor(-1)).toBe(COMPARE_SLOT_COLORS[0]);
  });

  it('every slot color exposes the expected fields', () => {
    for (const c of COMPARE_SLOT_COLORS) {
      expect(c).toMatchObject({
        base: expect.any(String),
        text: expect.any(String),
        bg: expect.any(String),
        border: expect.any(String),
        ring: expect.any(String),
      });
    }
  });
});

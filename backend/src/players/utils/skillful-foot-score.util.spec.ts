import { pctToZeroTenScale } from './skillful-foot-score.util';

describe('pctToZeroTenScale', () => {
  describe('when input is null or undefined', () => {
    it('should return null for null', () => {
      const input = null;

      const result = pctToZeroTenScale(input);

      expect(result).toBeNull();
    });

    it('should return null for undefined', () => {
      const input = undefined;

      const result = pctToZeroTenScale(input);

      expect(result).toBeNull();
    });

    it('should return null for NaN', () => {
      const input = NaN;

      const result = pctToZeroTenScale(input);

      expect(result).toBeNull();
    });
  });

  describe('when input is a valid percentage', () => {
    it('should convert 0% to 0', () => {
      const input = 0;

      const result = pctToZeroTenScale(input);

      expect(result).toBe(0);
    });

    it('should convert 100% to 10', () => {
      const input = 100;

      const result = pctToZeroTenScale(input);

      expect(result).toBe(10);
    });

    it('should convert 50% to 5', () => {
      const input = 50;

      const result = pctToZeroTenScale(input);

      expect(result).toBe(5);
    });

    it('should convert 75% to 7.5', () => {
      const input = 75;

      const result = pctToZeroTenScale(input);

      expect(result).toBe(7.5);
    });
  });

  describe('when input is out of range', () => {
    it('should clamp values above 100 to 10', () => {
      const input = 150;

      const result = pctToZeroTenScale(input);

      expect(result).toBe(10);
    });

    it('should clamp negative values to 0', () => {
      const input = -20;

      const result = pctToZeroTenScale(input);

      expect(result).toBe(0);
    });
  });
});

import { envToNumber } from './env-to-number.util';

describe('env-to-number.util', () => {
  describe('envToNumber', () => {
    it('should return undefined if not set', () => {
      expect(envToNumber('x')).toEqual(undefined);
    });
    it('should return undefined if provided value is not parseable', () => {
      process.env.x = 'unparseable';
      expect(envToNumber('x')).toEqual(undefined);
    });
    it('should return the provided number', () => {
      process.env.x = '5';
      expect(envToNumber('x')).toEqual(5);
    });
    it('should return default value if field is not set', () => {
      expect(envToNumber('x', 5)).toEqual(5);
    });
    it('should return default value if provided value is not parseable', () => {
      process.env.x = 'unparseable';
      expect(envToNumber('x', 5)).toEqual(5);
    });
  });
});

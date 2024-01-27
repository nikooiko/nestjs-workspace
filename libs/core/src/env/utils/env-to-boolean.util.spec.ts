import { envToBoolean } from './env-to-boolean.util';

describe('env-to-boolean.util', () => {
  describe('envToBoolean', () => {
    it('should return false if field is not set', () => {
      expect(envToBoolean('x')).toEqual(false);
    });
    it('should return false if field is set to false', () => {
      process.env.x = 'false';
      expect(envToBoolean('x')).toEqual(false);
    });
    it('should return true if field is set to true', () => {
      process.env.x = 'true';
      expect(envToBoolean('x')).toEqual(true);
    });
    it('should return true if field is set to True', () => {
      process.env.x = 'True';
      expect(envToBoolean('x')).toEqual(true);
    });
    it('should return default value if field is not set', () => {
      expect(envToBoolean('x', true)).toEqual(true);
    });
  });
});

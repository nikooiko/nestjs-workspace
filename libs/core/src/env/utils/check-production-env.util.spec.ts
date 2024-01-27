import { getEnvWithProdGuard } from './check-production-env.util';

describe('check-production-env.util', () => {
  describe('getEnvWithProdGuard', () => {
    it('should throw if prop missing and in production', () => {
      process.env.NODE_ENV = 'production';
      expect(() => getEnvWithProdGuard('x')).toThrow(
        'Missing x at production env',
      );
    });
    it('should not throw if prop missing and not in production', () => {
      process.env.NODE_ENV = 'test';
      expect(getEnvWithProdGuard('x')).toEqual('');
    });
    it('should should return env variable value', () => {
      process.env.NODE_ENV = 'test';
      process.env.y = 'y';
      expect(getEnvWithProdGuard('y')).toEqual('y');
    });
  });
});

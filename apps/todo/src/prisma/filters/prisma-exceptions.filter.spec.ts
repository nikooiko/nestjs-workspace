import { PrismaExceptionsFilter } from './prisma-exceptions.filter';

describe('PrismaExceptionsFilter', () => {
  it('should be defined', () => {
    expect(new PrismaExceptionsFilter({} as any)).toBeDefined();
  });
});

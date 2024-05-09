import { CommaSeparatedArrayParam } from './comma-separated-array-param.decorator';
import { dtoTestCase } from '@app/testing/dto/dto-test-case';

enum RandomEnum {
  RANDOM = 'RANDOM',
  MORE_RANDOM = 'MORE_RANDOM',
}

class CommaSeparatedArrayDto {
  @CommaSeparatedArrayParam()
  readonly str?: string[];

  @CommaSeparatedArrayParam(Number)
  readonly int?: number[];

  @CommaSeparatedArrayParam(String, RandomEnum)
  readonly strEnum?: RandomEnum[];
}

describe('comma-separated-array-param.decorator', () => {
  dtoTestCase(
    CommaSeparatedArrayDto,
    'should pass without values',
    {},
    { expectedOutput: {} },
  );
  describe('string array', () => {
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should pass with "a"',
      { str: 'a' },
      { expectedOutput: { str: ['a'] } },
    );
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should pass with "a,b,c"',
      { str: 'a,b,c' },
      { expectedOutput: { str: ['a', 'b', 'c'] } },
    );
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should pass with "1,2"',
      { str: '1,2' },
      { expectedOutput: { str: ['1', '2'] } },
    );
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should pass with ["1", "2"]',
      { str: ['1', '2'] },
      { expectedOutput: { str: ['1', '2'] } },
    );
  });
  describe('number array', () => {
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should pass with "1"',
      { int: '1' },
      { expectedOutput: { int: [1] } },
    );
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should pass with "1,2"',
      { int: '1,2' },
      { expectedOutput: { int: [1, 2] } },
    );
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should pass with ["1", "2"]',
      { int: ['1', '2'] },
      { expectedOutput: { int: [1, 2] } },
    );
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should fail with "a"',
      { int: 'a' },
      { expectedErrors: [{ field: 'int', errorType: 'isInt' }] },
    );
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should fail with "a,b,c"',
      { int: 'a,b,c' },
      { expectedErrors: [{ field: 'int', errorType: 'isInt' }] },
    );
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should fail with ["1", "b"]',
      { int: ['1', 'b'] },
      { expectedErrors: [{ field: 'int', errorType: 'isInt' }] },
    );
  });
  describe('string enum array', () => {
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should pass with "RANDOM"',
      { strEnum: 'RANDOM' },
      { expectedOutput: { strEnum: ['RANDOM'] } },
    );
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should pass with "RANDOM,MORE_RANDOM"',
      { strEnum: 'RANDOM,MORE_RANDOM' },
      { expectedOutput: { strEnum: ['RANDOM', 'MORE_RANDOM'] } },
    );
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should pass with ["RANDOM", "MORE_RANDOM"]',
      { strEnum: ['RANDOM', 'MORE_RANDOM'] },
      { expectedOutput: { strEnum: ['RANDOM', 'MORE_RANDOM'] } },
    );
    dtoTestCase(
      CommaSeparatedArrayDto,
      'should not pass with ["RANDOM", "NOT_RANDOM"]',
      { strEnum: ['RANDOM', 'NOT_RANDOM'] },
      { expectedErrors: [{ field: 'strEnum', errorType: 'isEnum' }] },
    );
  });
});

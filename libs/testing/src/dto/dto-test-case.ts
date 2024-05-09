import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { validateErrorText } from './validate-error-text';

export const dtoTestCase = (
  DTO: any,
  itMessage: string,
  input: any,
  expectation: {
    expectedErrors?: {
      field: string;
      errorType: string;
      errorValue?: string;
    }[];
    expectedOutput?: any;
  },
) => {
  it(itMessage, async () => {
    const { expectedOutput } = expectation;
    const expectedErrors = expectation.expectedErrors || [];
    const output = plainToInstance(DTO, input, {
      enableImplicitConversion: true,
    });
    const errors = await validate(output);
    try {
      expect(errors.length).toEqual(expectedErrors.length);
      if (expectedErrors.length) {
        expectedErrors.forEach(({ field, errorType, errorValue }) =>
          validateErrorText(errors, field, errorType, errorValue),
        );
      }
    } catch (err) {
      err.message = `${err} - expected:${expectedErrors.map(
        (e) => e.errorType,
      )} - received:${errors.map((e) => Object.keys(e.constraints ?? {}))}`;
      throw err;
    }
    if (expectedOutput) {
      expect(output).toEqual(expectedOutput);
    }
  });
};

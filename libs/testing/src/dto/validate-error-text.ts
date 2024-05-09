import { ValidationError } from 'class-validator';

export const validateErrorText = (
  errors: ValidationError[],
  field: string,
  errorType: string,
  errorValue: any,
) => {
  const error = errors.find((e) => e.property === field);
  expect(error?.constraints?.hasOwnProperty(errorType)).toEqual(true);
  if (errorValue) {
    expect(error?.constraints?.[errorType]).toEqual(errorValue);
  }
};

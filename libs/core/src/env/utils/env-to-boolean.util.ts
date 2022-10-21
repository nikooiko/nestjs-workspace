export const envToBoolean = (
  field: string,
  defaultValue?: boolean,
): boolean => {
  const value = process.env[field];
  return value ? value.toLowerCase() === 'true' : defaultValue;
};

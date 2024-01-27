export const envToBoolean = (field: string, defaultValue = false): boolean => {
  const value = process.env[field];
  return value ? value.toLowerCase() === 'true' : defaultValue;
};

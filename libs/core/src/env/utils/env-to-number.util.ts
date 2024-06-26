export const envToNumber = <T = undefined>(
  field: string,
  defaultValue: T,
): number | T => {
  const value = process.env[field] || '';
  const valueInt = Number.parseInt(value, 10);
  return Number.isFinite(valueInt) ? valueInt : defaultValue;
};

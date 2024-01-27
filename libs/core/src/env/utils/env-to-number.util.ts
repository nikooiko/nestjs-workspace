export const envToNumber = (
  field: string,
  defaultValue?: number,
): number | undefined => {
  const value = process.env[field] || '';
  const valueInt = Number.parseInt(value, 10);
  return Number.isFinite(valueInt) ? valueInt : defaultValue;
};

/**
 * Retrieves corresponding env variable based on provided key and if in production and value is not provided,
 * throws an error
 * @param {string} key
 * @returns {string}
 */
export function getEnvWithProdGuard(key: string): string {
  const value = process.env[key];
  if (process.env.NODE_ENV === 'production' && !value) {
    throw new Error(`⚠️ Missing ${key} at production environment! ⚠️`);
  }
  return process.env[key] || '';
}

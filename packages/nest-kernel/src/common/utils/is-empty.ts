export const isEmpty = (
  value: unknown
): value is null | undefined | '' | [] | Record<string, never> => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'boolean' || typeof value === 'number') return false;
  if (typeof value === 'string' || Array.isArray(value))
    return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

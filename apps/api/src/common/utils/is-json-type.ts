import { JsonValue } from '@common/interfaces';

export function isJSONValue(value: unknown): value is JsonValue {
  if (value === null || typeof value !== 'object') {
    return (
      ['string', 'number', 'boolean'].includes(typeof value) || value === null
    );
  }
  return true;
}

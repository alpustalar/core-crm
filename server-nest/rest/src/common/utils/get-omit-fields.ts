import { SYSTEM_FIELDS } from '../constants';

/**
 * Bir entity için standart omit listesini (system fields + özel alanlar) oluşturur.
 */

export function getOmitFields<T>(relations: readonly (keyof T)[] = []) {
  return [...SYSTEM_FIELDS, ...relations] as unknown as readonly (keyof T)[];
}

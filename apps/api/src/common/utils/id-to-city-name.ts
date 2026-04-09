/* eslint-disable */
import { citiesAndDistricts } from '../data';

export const idToCityName = (id?: number | string) => {
  if (!id) return null;
  id = Number(id);
  const city = citiesAndDistricts.find((city) => city.id === id);
  if (city) {
    return city.name;
  }
  return null;
};

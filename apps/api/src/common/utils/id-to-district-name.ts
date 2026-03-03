import { citiesAndDistricts } from '../data';

export const idToDistrictName = (
  cityId: string | number,
  districtId: string | number,
) => {
  cityId = Number(cityId);
  districtId = Number(districtId);

  if (!cityId || !districtId) {
    return null;
  }
  const city = citiesAndDistricts.find((city) => city.id === cityId);
  if (!city) {
    return null;
  }
  const district = city.districts.find(
    (district) => district.id === districtId,
  );
  return district?.name ?? null;
};

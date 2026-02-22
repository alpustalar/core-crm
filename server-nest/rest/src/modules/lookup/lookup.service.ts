import { Injectable } from '@nestjs/common';
import { citiesAndDistricts } from '@common/data';

@Injectable()
export class LookupService {
  private readonly cityMap = new Map<
    number,
    (typeof citiesAndDistricts)[number]
  >(citiesAndDistricts.map((city) => [city.id, city]));
  cities() {
    return citiesAndDistricts.map((city) => ({
      id: city.id,
      name: city.name,
    }));
  }
  districts(cityId: number) {
    return this.cityMap.get(cityId)?.districts ?? [];
  }
}

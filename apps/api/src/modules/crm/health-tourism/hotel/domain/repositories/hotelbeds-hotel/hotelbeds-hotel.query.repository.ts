import { HotelbedsHotel } from '@shared';

export const HOTELBEDS_HOTEL_QUERY_REPOSITORY = Symbol(
  'IHotelbedsHotelQueryRepository'
);

export interface IHotelbedsHotelQueryRepository {
  findById(id: string): Promise<HotelbedsHotel | null>;
  findByDestination(destinationCode: string): Promise<HotelbedsHotel[]>;
  countByCountry(): Promise<number>;
}

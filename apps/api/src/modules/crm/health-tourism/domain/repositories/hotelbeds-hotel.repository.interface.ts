import { HotelbedsHotel } from '../entities/hotelbeds-hotel.entity';

export const HOTELBEDS_HOTEL_COMMAND_REPOSITORY = Symbol('IHotelbedsHotelCommandRepository');
export const HOTELBEDS_HOTEL_QUERY_REPOSITORY = Symbol('IHotelbedsHotelQueryRepository');

export interface UpsertHotelbedsHotelInput {
  id: string;
  name: string;
  categoryCode: string;
  categoryName?: string;
  destinationCode: string;
  destinationName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  images?: unknown;
  phones?: unknown;
  lastSyncedAt: Date;
}

export interface IHotelbedsHotelCommandRepository {
  upsertMany(hotels: UpsertHotelbedsHotelInput[]): Promise<void>;
}

export interface IHotelbedsHotelQueryRepository {
  findById(id: string): Promise<HotelbedsHotel | null>;
  findByDestination(destinationCode: string): Promise<HotelbedsHotel[]>;
  countByCountry(): Promise<number>;
}

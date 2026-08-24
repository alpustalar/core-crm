import { UpsertHotelbedsHotelInput } from '@modules/crm/health-tourism/hotel/domain/contracts';

export const HOTELBEDS_HOTEL_COMMAND_REPOSITORY = Symbol(
  'IHotelbedsHotelCommandRepository'
);
export interface IHotelbedsHotelCommandRepository {
  syncMany(hotels: UpsertHotelbedsHotelInput[]): Promise<void>;
}

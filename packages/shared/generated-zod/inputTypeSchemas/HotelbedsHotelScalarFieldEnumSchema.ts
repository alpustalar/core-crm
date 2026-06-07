import { z } from 'zod';

export const HotelbedsHotelScalarFieldEnumSchema = z.enum(['id','name','categoryCode','categoryName','destinationCode','destinationName','address','latitude','longitude','images','phones','lastSyncedAt','createdAt','updatedAt']);

export default HotelbedsHotelScalarFieldEnumSchema;

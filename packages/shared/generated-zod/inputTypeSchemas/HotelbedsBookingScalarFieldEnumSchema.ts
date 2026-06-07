import { z } from 'zod';

export const HotelbedsBookingScalarFieldEnumSchema = z.enum(['id','reference','hotelCode','patientId','leadId','checkIn','checkOut','status','totalNet','currency','holderName','holderSurname','rooms','remarks','serviceFee','organizationId','clinicId','createdAt','updatedAt']);

export default HotelbedsBookingScalarFieldEnumSchema;

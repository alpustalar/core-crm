import { z } from 'zod';

export const HotelbedsBookingScalarFieldEnumSchema = z.enum(['id','patientId','organizationId','clinicId','reference','clientReference','hotelCode','leadId','checkIn','checkOut','status','totalNet','currency','holderName','holderSurname','rooms','remarks','serviceFee','createdAt','updatedAt']);

export default HotelbedsBookingScalarFieldEnumSchema;

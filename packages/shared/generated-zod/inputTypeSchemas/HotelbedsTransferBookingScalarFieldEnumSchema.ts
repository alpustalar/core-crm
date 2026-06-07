import { z } from 'zod';

export const HotelbedsTransferBookingScalarFieldEnumSchema = z.enum(['id','reference','clientReference','status','holderName','holderSurname','holderEmail','holderPhone','transfers','totalAmount','currency','remarks','organizationId','clinicId','patientId','leadId','createdAt','updatedAt']);

export default HotelbedsTransferBookingScalarFieldEnumSchema;

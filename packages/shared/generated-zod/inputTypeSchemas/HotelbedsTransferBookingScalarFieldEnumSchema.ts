import { z } from 'zod';

export const HotelbedsTransferBookingScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','patientId','leadId','reference','clientReference','status','holderName','holderSurname','holderEmail','holderPhone','transfers','totalAmount','currency','remarks','createdAt','updatedAt']);

export default HotelbedsTransferBookingScalarFieldEnumSchema;

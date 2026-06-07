import { z } from 'zod';

export const PaymentScalarFieldEnumSchema = z.enum(['id','clinicId','patientId','appointmentId','providerId','totalAmount','currency','status','createdAt','updatedAt']);

export default PaymentScalarFieldEnumSchema;

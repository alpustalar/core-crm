import { z } from 'zod';

export const PaymentScalarFieldEnumSchema = z.enum(['id','clinicId','patientId','appointmentId','method','expectedAmount','currency','status','createdAt','updatedAt']);

export default PaymentScalarFieldEnumSchema;

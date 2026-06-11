import { z } from 'zod';

export const InvoiceScalarFieldEnumSchema = z.enum(['id','clinicId','patientId','appointmentId','paymentId','amount','currency','vatRate','netTotal','vatTotal','status','invoiceNumber','issuedAt','providerRef','rawResponse','createdAt','updatedAt','isDeleted']);

export default InvoiceScalarFieldEnumSchema;

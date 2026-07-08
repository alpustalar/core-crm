import { z } from 'zod';

export const IyzicoTransactionScalarFieldEnumSchema = z.enum(['id','installmentId','conversationId','iyzicoPaymentId','iyzicoPaymentTransactionId','token','rawResponse','status','errorCode','errorMessage','createdAt','updatedAt']);

export default IyzicoTransactionScalarFieldEnumSchema;

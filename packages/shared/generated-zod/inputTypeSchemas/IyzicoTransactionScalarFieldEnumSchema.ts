import { z } from 'zod';

export const IyzicoTransactionScalarFieldEnumSchema = z.enum(['id','paymentId','conversationId','token','iyzicoPaymentId','iyzicoPaymentTransactionId','rawResponse','status','errorCode','errorMessage','createdAt','updatedAt']);

export default IyzicoTransactionScalarFieldEnumSchema;

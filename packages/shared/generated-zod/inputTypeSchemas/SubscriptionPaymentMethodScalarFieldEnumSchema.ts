import { z } from 'zod';

export const SubscriptionPaymentMethodScalarFieldEnumSchema = z.enum(['id','subscriptionId','provider','cardUserKey','cardToken','maskedNumber','cardAssociation','cardFamily','buyerName','buyerSurname','buyerEmail','buyerGsmNumber','buyerIp','buyerCity','buyerAddress','createdAt','updatedAt']);

export default SubscriptionPaymentMethodScalarFieldEnumSchema;

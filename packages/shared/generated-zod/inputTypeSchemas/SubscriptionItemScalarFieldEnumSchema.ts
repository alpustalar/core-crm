import { z } from 'zod';

export const SubscriptionItemScalarFieldEnumSchema = z.enum(['id','subscriptionId','planId','moduleId','externalPriceId','priceAtPurchase','currency','createdAt']);

export default SubscriptionItemScalarFieldEnumSchema;

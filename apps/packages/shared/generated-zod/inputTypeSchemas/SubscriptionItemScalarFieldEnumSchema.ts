import { z } from 'zod';

export const SubscriptionItemScalarFieldEnumSchema = z.enum(['id','subscriptionId','planId','moduleId','priceAtPurchase','externalPriceId','createdAt']);

export default SubscriptionItemScalarFieldEnumSchema;

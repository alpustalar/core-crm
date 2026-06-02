import { z } from 'zod';

export const SubscriptionScalarFieldEnumSchema = z.enum(['id','organizationId','externalId','status','trialEndsAt','currentPeriodStart','currentPeriodEnd','cancelAtPeriodEnd','createdAt','updatedAt']);

export default SubscriptionScalarFieldEnumSchema;

import { z } from 'zod';

export const SubscriptionScalarFieldEnumSchema = z.enum(['id','organizationId','clinicId','externalId','billingTarget','status','trialEndsAt','currentPeriodStart','currentPeriodEnd','cancelAtPeriodEnd','createdAt','updatedAt','version']);

export default SubscriptionScalarFieldEnumSchema;

import { z } from 'zod';

export const ProviderAvailabilityScalarFieldEnumSchema = z.enum(['id','providerId','dayOfWeek','startMinute','endMinute','breakStartMinute','breakEndMinute','createdAt','updatedAt']);

export default ProviderAvailabilityScalarFieldEnumSchema;

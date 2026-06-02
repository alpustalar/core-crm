import { z } from 'zod';

export const ProviderAvailabilityScalarFieldEnumSchema = z.enum(['id','dayOfWeek','startMinute','endMinute','breakStartMinute','breakEndMinute','createdAt','updatedAt','providerId']);

export default ProviderAvailabilityScalarFieldEnumSchema;

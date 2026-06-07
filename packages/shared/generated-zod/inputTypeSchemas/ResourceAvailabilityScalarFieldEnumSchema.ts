import { z } from 'zod';

export const ResourceAvailabilityScalarFieldEnumSchema = z.enum(['id','dayOfWeek','startMinute','endMinute','isClosed','resourceId']);

export default ResourceAvailabilityScalarFieldEnumSchema;

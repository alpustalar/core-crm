import { z } from 'zod';

export const ResourceAvailabilityScalarFieldEnumSchema = z.enum(['id','resourceId','dayOfWeek','startMinute','endMinute','isClosed']);

export default ResourceAvailabilityScalarFieldEnumSchema;

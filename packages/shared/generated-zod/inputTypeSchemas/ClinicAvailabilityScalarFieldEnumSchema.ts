import { z } from 'zod';

export const ClinicAvailabilityScalarFieldEnumSchema = z.enum(['id','clinicId','dayOfWeek','startMinute','endMinute','isClosed']);

export default ClinicAvailabilityScalarFieldEnumSchema;

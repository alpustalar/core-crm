import { z } from 'zod';

export const ClinicAvailabilityScalarFieldEnumSchema = z.enum(['id','dayOfWeek','startMinute','endMinute','isClosed','clinicId']);

export default ClinicAvailabilityScalarFieldEnumSchema;

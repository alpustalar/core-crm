import { z } from 'zod';

export const ClinicExceptionScalarFieldEnumSchema = z.enum(['id','date','isClosed','reason','clinicId']);

export default ClinicExceptionScalarFieldEnumSchema;

import { z } from 'zod';

export const ClinicExceptionScalarFieldEnumSchema = z.enum(['id','clinicId','date','isClosed','reason']);

export default ClinicExceptionScalarFieldEnumSchema;

import { z } from 'zod';

export const ProviderExceptionScalarFieldEnumSchema = z.enum(['id','startTime','endTime','type','reason','providerId','createdAt']);

export default ProviderExceptionScalarFieldEnumSchema;

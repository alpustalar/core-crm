import { z } from 'zod';

export const ProviderExceptionScalarFieldEnumSchema = z.enum(['id','providerId','startTime','endTime','type','reason','createdAt']);

export default ProviderExceptionScalarFieldEnumSchema;

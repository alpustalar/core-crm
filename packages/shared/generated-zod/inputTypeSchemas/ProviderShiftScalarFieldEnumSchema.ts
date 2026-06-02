import { z } from 'zod';

export const ProviderShiftScalarFieldEnumSchema = z.enum(['id','providerId','date','startMinute','endMinute','breakStartMinute','breakEndMinute']);

export default ProviderShiftScalarFieldEnumSchema;

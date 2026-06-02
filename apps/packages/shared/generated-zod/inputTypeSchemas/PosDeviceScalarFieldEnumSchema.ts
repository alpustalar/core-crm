import { z } from 'zod';

export const PosDeviceScalarFieldEnumSchema = z.enum(['id','clinicId','label','terminalId','merchantId','host','port','isActive','isDeleted','createdAt','updatedAt']);

export default PosDeviceScalarFieldEnumSchema;

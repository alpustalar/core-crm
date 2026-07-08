import { z } from 'zod';

export const PosDeviceScalarFieldEnumSchema = z.enum(['id','clinicId','terminalId','merchantId','deviceUniqueId','label','provider','host','port','isActive','isDeleted','createdAt','updatedAt']);

export default PosDeviceScalarFieldEnumSchema;

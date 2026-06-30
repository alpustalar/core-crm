import { z } from 'zod';

export const PosDeviceScalarFieldEnumSchema = z.enum(['id','clinicId','label','provider','terminalId','merchantId','host','port','deviceUniqueId','isActive','isDeleted','createdAt','updatedAt']);

export default PosDeviceScalarFieldEnumSchema;

import { z } from 'zod';

export const StaffNotificationScalarFieldEnumSchema = z.enum(['id','clinicId','staffId','type','title','body','paramsJson','deepLink','priority','isRead','readAt','deliveryStatus','deliveredAt','createdAt','updatedAt']);

export default StaffNotificationScalarFieldEnumSchema;

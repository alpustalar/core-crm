import { z } from 'zod';
export declare const RoleCapabilitySchema: z.ZodObject<{
    id: z.ZodUUID;
    roleId: z.ZodString;
    capabilityId: z.ZodString;
    createdAt: z.ZodCoercedDate<unknown>;
}, z.core.$strip>;
export type RoleCapability = z.infer<typeof RoleCapabilitySchema>;
export default RoleCapabilitySchema;

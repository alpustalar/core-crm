import { z } from 'zod';
export declare const RoleSchema: z.ZodObject<{
    id: z.ZodUUID;
    name: z.ZodString;
    slug: z.ZodString;
    priority: z.ZodNumber;
    isSystemRole: z.ZodBoolean;
    createdAt: z.ZodCoercedDate<unknown>;
    updatedAt: z.ZodCoercedDate<unknown>;
}, z.core.$strip>;
export type Role = z.infer<typeof RoleSchema>;
export default RoleSchema;

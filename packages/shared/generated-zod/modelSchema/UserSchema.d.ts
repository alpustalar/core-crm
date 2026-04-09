import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
    status: z.ZodEnum<{
        ACTIVE: "ACTIVE";
        DELETED: "DELETED";
        SUSPENDED: "SUSPENDED";
    }>;
    id: z.ZodString;
    displayName: z.ZodString;
    email: z.ZodString;
    emailVerified: z.ZodBoolean;
    roleId: z.ZodNullable<z.ZodString>;
    picture: z.ZodNullable<z.ZodString>;
    clinicId: z.ZodNullable<z.ZodString>;
    lastLogin: z.ZodCoercedDate<unknown>;
    createdAt: z.ZodCoercedDate<unknown>;
    updatedAt: z.ZodCoercedDate<unknown>;
    deletedAt: z.ZodNullable<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
export type User = z.infer<typeof UserSchema>;
export default UserSchema;

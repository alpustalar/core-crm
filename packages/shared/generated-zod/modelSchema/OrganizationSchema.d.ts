import { z } from 'zod';
export declare const OrganizationSchema: z.ZodObject<{
    status: z.ZodEnum<{
        ACTIVE: "ACTIVE";
        DELETED: "DELETED";
        SUSPENDED: "SUSPENDED";
        TRIAL: "TRIAL";
    }>;
    id: z.ZodUUID;
    name: z.ZodString;
    slug: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    email: z.ZodNullable<z.ZodString>;
    address: z.ZodNullable<z.ZodString>;
    city: z.ZodNullable<z.ZodString>;
    district: z.ZodNullable<z.ZodString>;
    timezone: z.ZodString;
    createdAt: z.ZodCoercedDate<unknown>;
    updatedAt: z.ZodCoercedDate<unknown>;
    deletedAt: z.ZodNullable<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
export type Organization = z.infer<typeof OrganizationSchema>;
export default OrganizationSchema;

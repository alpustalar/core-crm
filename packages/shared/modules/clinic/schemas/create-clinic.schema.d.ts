import { z } from "zod";
export declare const CreateClinicSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        DELETED: "DELETED";
        SUSPENDED: "SUSPENDED";
        TRIAL: "TRIAL";
    }>>;
    timezone: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strip>;

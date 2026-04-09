import { z } from "zod";
export declare const UserSoftDeleteByActorSchema: z.ZodObject<{
    id: z.ZodString;
    clinicId: z.ZodUUID;
    role: z.ZodObject<{
        id: z.ZodUUID;
        name: z.ZodString;
        slug: z.ZodString;
        priority: z.ZodNumber;
        isSystemRole: z.ZodBoolean;
        createdAt: z.ZodCoercedDate<unknown>;
        updatedAt: z.ZodCoercedDate<unknown>;
    }, z.core.$strip>;
}, z.core.$strip>;

import { z } from "zod";
export declare const SendUserPasswordResetByActorSchema: z.ZodObject<{
    id: z.ZodString;
    clinicId: z.ZodUUID;
}, z.core.$strip>;

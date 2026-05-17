import { z } from "zod";
export declare const UserUpdateBySelfSchema: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    picture: z.ZodOptional<z.ZodURL>;
}, z.core.$strip>;

import { z } from "zod";
export declare const CheckEmailSchema: z.ZodObject<{
    email: z.ZodEmail;
}, z.core.$strip>;

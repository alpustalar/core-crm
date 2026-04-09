import { z } from 'zod';
export declare const CapabilitySchema: z.ZodObject<{
    id: z.ZodUUID;
    name: z.ZodString;
    module: z.ZodString;
    action: z.ZodString;
}, z.core.$strip>;
export type Capability = z.infer<typeof CapabilitySchema>;
export default CapabilitySchema;

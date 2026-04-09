import { z } from 'zod';
export declare const GlobalStatusSchema: z.ZodEnum<{
    ACTIVE: "ACTIVE";
    DELETED: "DELETED";
    SUSPENDED: "SUSPENDED";
    TRIAL: "TRIAL";
}>;
export type GlobalStatusType = `${z.infer<typeof GlobalStatusSchema>}`;
export default GlobalStatusSchema;

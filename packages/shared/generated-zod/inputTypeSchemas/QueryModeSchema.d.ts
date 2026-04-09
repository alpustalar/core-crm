import { z } from 'zod';
export declare const QueryModeSchema: z.ZodEnum<{
    default: "default";
    insensitive: "insensitive";
}>;
export default QueryModeSchema;

import { z } from 'zod';

export type JsonValueType =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValueType | undefined }
  | JsonValueType[];

export const JsonValueSchema: z.ZodType<JsonValueType> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.string(), z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);


export default JsonValueSchema

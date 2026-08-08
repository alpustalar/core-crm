import { z } from 'zod';

export type InputJsonValueType =
  | string
  | number
  | boolean
  | { toJSON: () => unknown }
  | { [key: string]: InputJsonValueType | null | undefined }
  | Array<InputJsonValueType | null>;

export const InputJsonValueSchema: z.ZodType<InputJsonValueType> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.any() }),
    z.record(z.string(), z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);


export default InputJsonValueSchema;

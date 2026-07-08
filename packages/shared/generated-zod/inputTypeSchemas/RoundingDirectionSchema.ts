import { z } from 'zod';

export const RoundingDirectionSchema = z.enum(['NONE','UP','DOWN','NEAREST']);

export type RoundingDirectionType = `${z.infer<typeof RoundingDirectionSchema>}`

export default RoundingDirectionSchema;

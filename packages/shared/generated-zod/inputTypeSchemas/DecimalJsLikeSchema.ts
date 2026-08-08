import { z } from 'zod';
import type { DecimalJsLike } from '../../common/decimal';

export const DecimalJsLikeSchema: z.ZodType<DecimalJsLike> = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.any(),
})

export default DecimalJsLikeSchema;

import { z } from 'zod';

export const StockMovementDirectionSchema = z.enum(['IN','OUT']);

export type StockMovementDirectionType = `${z.infer<typeof StockMovementDirectionSchema>}`

export default StockMovementDirectionSchema;

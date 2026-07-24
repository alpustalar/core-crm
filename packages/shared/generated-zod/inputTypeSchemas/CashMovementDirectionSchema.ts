import { z } from 'zod';

export const CashMovementDirectionSchema = z.enum(['IN','OUT']);

export type CashMovementDirectionType = `${z.infer<typeof CashMovementDirectionSchema>}`

export default CashMovementDirectionSchema;

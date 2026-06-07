import { z } from 'zod';

export const StockMovementTypeSchema = z.enum(['PURCHASE','USAGE','RETURN_TO_SUPPLIER','RETURN_FROM_PATIENT','WASTE','ADJUSTMENT','TRANSFER_IN','TRANSFER_OUT']);

export type StockMovementTypeType = `${z.infer<typeof StockMovementTypeSchema>}`

export default StockMovementTypeSchema;

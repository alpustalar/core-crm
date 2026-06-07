import { z } from 'zod';

export const ProductUnitSchema = z.enum(['PIECE','ML','GR','KG','LITER','BOX','AMPULE','VIAL','BOTTLE','TUBE']);

export type ProductUnitType = `${z.infer<typeof ProductUnitSchema>}`

export default ProductUnitSchema;

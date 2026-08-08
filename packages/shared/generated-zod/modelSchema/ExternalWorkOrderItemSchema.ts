import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { decimalSchema } from '../../common/decimal';

/////////////////////////////////////////
// EXTERNAL WORK ORDER ITEM SCHEMA
/////////////////////////////////////////

export const ExternalWorkOrderItemSchema = z.object({
  id: z.string(),
  workOrderId: z.string(),
  description: z.string(),
  quantity: decimalSchema("Field 'quantity' must be a Decimal. Location: ['Models', 'ExternalWorkOrderItem']"),
  unitCost: decimalSchema("Field 'unitCost' must be a Decimal. Location: ['Models', 'ExternalWorkOrderItem']").nullable(),
  specs: JsonValueSchema.nullable(),
})

export type ExternalWorkOrderItem = z.infer<typeof ExternalWorkOrderItemSchema>

export default ExternalWorkOrderItemSchema;

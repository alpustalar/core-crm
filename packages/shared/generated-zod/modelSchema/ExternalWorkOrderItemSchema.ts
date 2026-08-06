import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// EXTERNAL WORK ORDER ITEM SCHEMA
/////////////////////////////////////////

export const ExternalWorkOrderItemSchema = z.object({
  id: z.string(),
  workOrderId: z.string(),
  description: z.string(),
  quantity: z.instanceof(Prisma.Decimal, { message: "Field 'quantity' must be a Decimal. Location: ['Models', 'ExternalWorkOrderItem']"}),
  unitCost: z.instanceof(Prisma.Decimal, { message: "Field 'unitCost' must be a Decimal. Location: ['Models', 'ExternalWorkOrderItem']"}).nullable(),
  specs: JsonValueSchema.nullable(),
})

export type ExternalWorkOrderItem = z.infer<typeof ExternalWorkOrderItemSchema>

export default ExternalWorkOrderItemSchema;

import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { TaxParameterKeySchema } from '../inputTypeSchemas/TaxParameterKeySchema'

/////////////////////////////////////////
// TAX PARAMETER SCHEMA
/////////////////////////////////////////

export const TaxParameterSchema = z.object({
  key: TaxParameterKeySchema,
  id: z.uuid(),
  clinicId: z.string(),
  organizationId: z.string(),
  rate: z.instanceof(Prisma.Decimal, { message: "Field 'rate' must be a Decimal. Location: ['Models', 'TaxParameter']"}),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type TaxParameter = z.infer<typeof TaxParameterSchema>

export default TaxParameterSchema;

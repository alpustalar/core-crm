import { z } from 'zod';
import { PartyTypeSchema } from '../inputTypeSchemas/PartyTypeSchema'
import { PartyRoleSchema } from '../inputTypeSchemas/PartyRoleSchema'
import { PartyOriginTypeSchema } from '../inputTypeSchemas/PartyOriginTypeSchema'

/////////////////////////////////////////
// PARTY SCHEMA
/////////////////////////////////////////

export const PartySchema = z.object({
  type: PartyTypeSchema,
  roles: PartyRoleSchema.array(),
  originType: PartyOriginTypeSchema,
  id: z.uuid(),
  clinicId: z.string(),
  organizationId: z.string(),
  name: z.string(),
  taxNumber: z.string().nullable(),
  nationalId: z.string().nullable(),
  taxOffice: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  isEInvoiceUser: z.boolean(),
  eInvoiceMailbox: z.string().nullable(),
  receivableAccountId: z.string().nullable(),
  payableAccountId: z.string().nullable(),
  originId: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Party = z.infer<typeof PartySchema>

export default PartySchema;

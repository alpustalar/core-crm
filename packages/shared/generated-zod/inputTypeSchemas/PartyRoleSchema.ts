import { z } from 'zod';

export const PartyRoleSchema = z.enum(['CUSTOMER','PATIENT','SUPPLIER','EMPLOYEE']);

export type PartyRoleType = `${z.infer<typeof PartyRoleSchema>}`

export default PartyRoleSchema;

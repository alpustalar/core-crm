import { z } from 'zod';
import { GlobalStatusSchema } from '../inputTypeSchemas/GlobalStatusSchema'

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  status: GlobalStatusSchema,
  id: z.string(),
  displayName: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  roleId: z.string().nullable(),
  picture: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  clinicId: z.string().nullable(),
  lastLogin: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type User = z.infer<typeof UserSchema>

export default UserSchema;

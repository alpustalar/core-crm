import { z } from 'zod';
import { UserStatusSchema } from '../inputTypeSchemas/UserStatusSchema'

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  status: UserStatusSchema,
  id: z.string(),
  displayName: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  roleId: z.string().nullable(),
  picture: z.string().nullable(),
  clinicId: z.string().nullable(),
  lastLogin: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type User = z.infer<typeof UserSchema>

export default UserSchema;

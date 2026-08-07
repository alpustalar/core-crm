import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { ProjectStatusSchema } from '../inputTypeSchemas/ProjectStatusSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// PROJECT SCHEMA
/////////////////////////////////////////

export const ProjectSchema = z.object({
  status: ProjectStatusSchema,
  currency: CurrencySchema,
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  /**
   * Klinik içinde insan-okur proje kodu (PRJ-2026-004 gibi); elle girilir.
   */
  code: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  ownerId: z.string(),
  startDate: z.coerce.date().nullable(),
  dueDate: z.coerce.date().nullable(),
  /**
   * Onaylı bütçe. Null = bütçesiz proje (takip yalnız görev/aşama üzerinden).
   */
  budget: z.instanceof(Prisma.Decimal, { message: "Field 'budget' must be a Decimal. Location: ['Models', 'Project']"}).nullable(),
  completedAt: z.coerce.date().nullable(),
  cancelledAt: z.coerce.date().nullable(),
  cancelReason: z.string().nullable(),
  createdById: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Project = z.infer<typeof ProjectSchema>

export default ProjectSchema;

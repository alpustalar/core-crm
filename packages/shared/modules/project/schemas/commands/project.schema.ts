import { z } from 'zod';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';
import ProjectStatusSchema from '@shared/generated-zod/inputTypeSchemas/ProjectStatusSchema';
import ProjectTaskStatusSchema from '@shared/generated-zod/inputTypeSchemas/ProjectTaskStatusSchema';
import ProjectTaskPrioritySchema from '@shared/generated-zod/inputTypeSchemas/ProjectTaskPrioritySchema';
import ProjectCostSourceSchema from '@shared/generated-zod/inputTypeSchemas/ProjectCostSourceSchema';
import ProjectResourceKindSchema from '@shared/generated-zod/inputTypeSchemas/ProjectResourceKindSchema';

/** Para tutarı: kuruş hassasiyeti kaybolmasın diye string kabul edilir. */
const MoneyString = z
  .string()
  .regex(/^-?\d+(\.\d{1,2})?$/, 'Tutar en fazla 2 ondalık haneli olmalıdır');

export const CreateProjectSchema = z.object({
  code: z.string().min(1).max(40).nullable().optional(),
  name: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  ownerId: z.uuid(),
  startDate: z.coerce.date().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  budget: MoneyString.nullable().optional(),
  currency: CurrencySchema.optional(),
});

export const UpdateProjectSchema = z.object({
  code: z.string().min(1).max(40).nullable().optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  ownerId: z.uuid().optional(),
  startDate: z.coerce.date().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  budget: MoneyString.nullable().optional(),
});

/**
 * Durum geçişi tek uçtan yürür; hangi geçişin geçerli olduğuna entity karar verir.
 * CANCELLED için gerekçe zorunludur.
 */
export const ChangeProjectStatusSchema = z
  .object({
    status: ProjectStatusSchema,
    reason: z.string().max(500).nullable().optional(),
  })
  .refine(
    (data) =>
      data.status !== 'CANCELLED' || (data.reason?.trim().length ?? 0) > 0,
    {
      message: 'İptal için gerekçe zorunludur',
      path: ['reason'],
    }
  );

export const CreateProjectPhaseSchema = z.object({
  name: z.string().min(1).max(200),
  order: z.coerce.number().int().min(0),
  startDate: z.coerce.date().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  budget: MoneyString.nullable().optional(),
});

export const UpdateProjectPhaseSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  order: z.coerce.number().int().min(0).optional(),
  startDate: z.coerce.date().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  budget: MoneyString.nullable().optional(),
});

export const CreateProjectTaskSchema = z.object({
  phaseId: z.uuid().nullable().optional(),
  parentTaskId: z.uuid().nullable().optional(),
  title: z.string().min(1).max(300),
  description: z.string().nullable().optional(),
  priority: ProjectTaskPrioritySchema.optional(),
  assigneeId: z.uuid().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  estimatedHours: MoneyString.nullable().optional(),
});

export const UpdateProjectTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().nullable().optional(),
  priority: ProjectTaskPrioritySchema.optional(),
  phaseId: z.uuid().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  estimatedHours: MoneyString.nullable().optional(),
  actualHours: MoneyString.nullable().optional(),
});

/** Kanban hareketi: hedef kolon + kolon içi yeni sıra. */
export const MoveProjectTaskSchema = z.object({
  status: ProjectTaskStatusSchema,
  boardOrder: z.coerce.number().int().min(0),
});

export const AssignProjectTaskSchema = z.object({
  /** null = atama kaldırılır. */
  assigneeId: z.uuid().nullable(),
});

export const RecordProjectCostSchema = z.object({
  phaseId: z.uuid().nullable().optional(),
  source: ProjectCostSourceSchema.optional(),
  sourceRefId: z.uuid().nullable().optional(),
  description: z.string().min(1).max(500),
  amount: MoneyString,
  currency: CurrencySchema.optional(),
  incurredAt: z.coerce.date(),
});

export const AllocateProjectResourceSchema = z.object({
  phaseId: z.uuid().nullable().optional(),
  kind: ProjectResourceKindSchema,
  resourceId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  /** Personel için kapasite yüzdesi; oda/cihazda daima 100 kabul edilir. */
  allocationPercent: z.coerce.number().int().min(1).max(100).optional(),
  note: z.string().max(500).nullable().optional(),
});

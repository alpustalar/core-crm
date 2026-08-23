import { z } from 'zod';
import { ResponseGroups } from '@common/constants/response-groups.constant';
import { Decimal } from 'decimal.js';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { ProjectStatusSchema } from '@input-type-schemas/ProjectStatusSchema';
import { ProjectPhaseStatusSchema } from '@input-type-schemas/ProjectPhaseStatusSchema';
import { ProjectTaskStatusSchema } from '@input-type-schemas/ProjectTaskStatusSchema';
import { ProjectTaskPrioritySchema } from '@input-type-schemas/ProjectTaskPrioritySchema';
import { ProjectCostSourceSchema } from '@input-type-schemas/ProjectCostSourceSchema';
import { ProjectResourceKindSchema } from '@input-type-schemas/ProjectResourceKindSchema';
import { Pagination } from '@shared/common';

// ==========================================
// PROJE — Entity static create() girişi
// ==========================================

export const CreateProjectSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  code: z.string().min(1).max(40).nullable().optional(),
  name: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  ownerId: z.uuid(),
  startDate: z.date().nullable().optional(),
  dueDate: z.date().nullable().optional(),
  budget: z
    .custom<Decimal>((val) => val instanceof Decimal)
    .nullable()
    .optional(),
  currency: CurrencySchema.optional(),
  createdById: z.uuid(),
});
export type CreateProjectProps = z.infer<typeof CreateProjectSchema>;

/** Proje künyesi güncelleme — durum/tarihçe DEĞİL, yalnız tanım alanları. */
export const UpdateProjectDetailsSchema = z.object({
  code: z.string().min(1).max(40).nullable().optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  ownerId: z.uuid().optional(),
  startDate: z.date().nullable().optional(),
  dueDate: z.date().nullable().optional(),
  budget: z
    .custom<Decimal>((val) => val instanceof Decimal)
    .nullable()
    .optional(),
});
export type UpdateProjectDetailsProps = z.infer<
  typeof UpdateProjectDetailsSchema
>;

// ==========================================
// AŞAMA (PHASE)
// ==========================================

export const CreateProjectPhaseSchema = z.object({
  id: z.uuid().optional(),
  projectId: z.uuid(),
  clinicId: z.uuid(),
  name: z.string().min(1).max(200),
  order: z.number().int().min(0),
  startDate: z.date().nullable().optional(),
  dueDate: z.date().nullable().optional(),
  budget: z
    .custom<Decimal>((val) => val instanceof Decimal)
    .nullable()
    .optional(),
});
export type CreateProjectPhaseProps = z.infer<typeof CreateProjectPhaseSchema>;

export const UpdateProjectPhaseSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  order: z.number().int().min(0).optional(),
  startDate: z.date().nullable().optional(),
  dueDate: z.date().nullable().optional(),
  budget: z
    .custom<Decimal>((val) => val instanceof Decimal)
    .nullable()
    .optional(),
});
export type UpdateProjectPhaseProps = z.infer<typeof UpdateProjectPhaseSchema>;

// ==========================================
// GÖREV (TASK)
// ==========================================

export const CreateProjectTaskSchema = z.object({
  id: z.uuid().optional(),
  projectId: z.uuid(),
  phaseId: z.uuid().nullable().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  parentTaskId: z.uuid().nullable().optional(),
  title: z.string().min(1).max(300),
  description: z.string().nullable().optional(),
  priority: ProjectTaskPrioritySchema.optional(),
  assigneeId: z.uuid().nullable().optional(),
  startDate: z.date().nullable().optional(),
  dueAt: z.date().nullable().optional(),
  estimatedHours: z
    .custom<Decimal>((val) => val instanceof Decimal)
    .nullable()
    .optional(),
  boardOrder: z.number().int().min(0).optional(),
  createdById: z.uuid(),
});
export type CreateProjectTaskProps = z.infer<typeof CreateProjectTaskSchema>;

export const UpdateProjectTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().nullable().optional(),
  priority: ProjectTaskPrioritySchema.optional(),
  phaseId: z.uuid().nullable().optional(),
  startDate: z.date().nullable().optional(),
  dueAt: z.date().nullable().optional(),
  estimatedHours: z
    .custom<Decimal>((val) => val instanceof Decimal)
    .nullable()
    .optional(),
  actualHours: z
    .custom<Decimal>((val) => val instanceof Decimal)
    .nullable()
    .optional(),
});
export type UpdateProjectTaskProps = z.infer<typeof UpdateProjectTaskSchema>;

/** Kanban hareketi: kolon (status) + kolon içi sıra birlikte değişir. */
export interface MoveProjectTaskProps {
  readonly status: z.infer<typeof ProjectTaskStatusSchema>;
  readonly boardOrder: number;
}

// ==========================================
// MALİYET (COST)
// ==========================================

export const RecordProjectCostSchema = z.object({
  id: z.uuid().optional(),
  projectId: z.uuid(),
  phaseId: z.uuid().nullable().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  source: ProjectCostSourceSchema.optional(),
  sourceRefId: z.uuid().nullable().optional(),
  description: z.string().min(1).max(500),
  amount: z.custom<Decimal>((val) => val instanceof Decimal),
  currency: CurrencySchema.optional(),
  incurredAt: z.date(),
  recordedById: z.uuid(),
});
export type RecordProjectCostProps = z.infer<typeof RecordProjectCostSchema>;

// ==========================================
// KAYNAK TAHSİSİ (RESOURCE ALLOCATION)
// ==========================================

export const AllocateProjectResourceSchema = z.object({
  id: z.uuid().optional(),
  projectId: z.uuid(),
  phaseId: z.uuid().nullable().optional(),
  clinicId: z.uuid(),
  kind: ProjectResourceKindSchema,
  resourceId: z.uuid(),
  startDate: z.date(),
  endDate: z.date(),
  allocationPercent: z.number().int().min(1).max(100).optional(),
  note: z.string().max(500).nullable().optional(),
  createdById: z.uuid(),
});
export type AllocateProjectResourceProps = z.infer<
  typeof AllocateProjectResourceSchema
>;

// ==========================================
// READ-MODEL'ler / FİLTRELER
// ==========================================

export interface FindProjectsFilter {
  clinicId: string;
  status?: z.infer<typeof ProjectStatusSchema>;
  ownerId?: string;
  search?: string;
  pagination: Pagination;
}

export interface FindProjectTasksFilter {
  projectId: string;
  status?: z.infer<typeof ProjectTaskStatusSchema>;
  assigneeId?: string;
  phaseId?: string;
}

export interface FindMyProjectTasksFilter {
  clinicId: string;
  assigneeId: string;
  status?: z.infer<typeof ProjectTaskStatusSchema>;
  pagination: Pagination;
}

/** Aşama bazında maliyet toplamı (bütçe-vs-fiili raporunun ham verisi). */
export interface ProjectCostTotalRow {
  phaseId: string | null;
  source: z.infer<typeof ProjectCostSourceSchema>;
  total: Decimal;
}

/** Kanban kolonu başına görev sayısı (pano özeti). */
export interface ProjectTaskStatusCountRow {
  status: z.infer<typeof ProjectTaskStatusSchema>;
  count: number;
}

/** Çakışma kontrolü için mevcut tahsis penceresi (yalnız gereken alanlar). */
export interface OverlappingAllocation {
  id: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  allocationPercent: number;
}

export interface FindOverlappingAllocationsProps {
  clinicId: string;
  kind: z.infer<typeof ProjectResourceKindSchema>;
  resourceId: string;
  startDate: Date;
  endDate: Date;
  /** Güncelleme akışında kendi kaydını çakışma saymamak için hariç tutulur. */
  excludeAllocationId?: string;
}

/** Kapasite çapa kilidi girdisi — kilitlenecek tablo `kind`'a göre seçilir. */
export interface LockResourceCapacityProps {
  kind: z.infer<typeof ProjectResourceKindSchema>;
  resourceId: string;
}

/** Kaynak takvimi satırı — bir kaynağın hangi projeye ne kadar ayrıldığı. */
export interface ResourceScheduleRow {
  allocationId: string;
  projectId: string;
  projectName: string;
  phaseId: string | null;
  kind: z.infer<typeof ProjectResourceKindSchema>;
  resourceId: string;
  startDate: Date;
  endDate: Date;
  allocationPercent: number;
  note: string | null;
}

export interface FindResourceScheduleFilter {
  clinicId: string;
  kind?: z.infer<typeof ProjectResourceKindSchema>;
  resourceId?: string;
  from: Date;
  to: Date;
}

export type ProjectPhaseStatusType = z.infer<typeof ProjectPhaseStatusSchema>;

// ==========================================
// Proje cevaplarının alan görünürlüğü; grupları ProjectPolicy üretir.
export const ProjectResponseGroups = ResponseGroups;

export type ProjectResponseGroup =
  (typeof ProjectResponseGroups)[keyof typeof ProjectResponseGroups];

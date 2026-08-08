import { z } from 'zod';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { ExternalWorkOrderStatusSchema } from '@input-type-schemas/ExternalWorkOrderStatusSchema';
import { WorkOrderItemSpecsSchema } from '@shared/modules/work-order/schemas';
import { ExternalWorkOrder as IExternalWorkOrder } from '@model-schema/ExternalWorkOrderSchema';
import { ExternalWorkOrderItem as IExternalWorkOrderItem } from '@model-schema/ExternalWorkOrderItemSchema';
import { Pagination } from '@shared/common';

// ==========================================
// DIŞ İŞ EMRİ (EXTERNAL WORK ORDER) — Props
// clinicId/organizationId/createdById bağlamdan (actor) gelir.
// ==========================================

export const WorkOrderItemPropsSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitCost: z.number().nonnegative().nullable().optional(),
  specs: WorkOrderItemSpecsSchema.nullable().optional(),
});
export type WorkOrderItemProps = z.infer<typeof WorkOrderItemPropsSchema>;

export const CreateExternalWorkOrderSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  supplierId: z.uuid(),
  patientId: z.uuid().nullable().optional(),
  treatmentId: z.uuid().nullable().optional(),
  providerId: z.uuid().nullable().optional(),
  referenceNo: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  agreedCost: z.number().nonnegative().nullable().optional(),
  currency: CurrencySchema.optional(),
  note: z.string().nullable().optional(),
  createdById: z.uuid().nullable().optional(),
  items: z.array(WorkOrderItemPropsSchema).min(1),
});
export type CreateExternalWorkOrderProps = z.infer<
  typeof CreateExternalWorkOrderSchema
>;

// ==========================================
// Okuma modelleri / filtreler
// ==========================================

export const FindWorkOrdersFilterSchema = z.object({
  clinicId: z.uuid(),
  status: ExternalWorkOrderStatusSchema.optional(),
  supplierId: z.uuid().optional(),
  patientId: z.uuid().optional(),
  overdue: z.boolean().optional(),
  dueBefore: z.coerce.date().optional(),
  pagination: z.custom<Pagination>(() => true),
});
export type FindWorkOrdersFilter = z.infer<typeof FindWorkOrdersFilterSchema>;

/** Liste/detay okuma modeli — satırlarıyla birlikte ham kayıt. */
export type ExternalWorkOrderWithItems = IExternalWorkOrder & {
  items: IExternalWorkOrderItem[];
};

/** Klinik panosu: statü başına adet + geciken adedi. */
export interface WorkOrderSummary {
  byStatus: Record<string, number>;
  overdueCount: number;
}

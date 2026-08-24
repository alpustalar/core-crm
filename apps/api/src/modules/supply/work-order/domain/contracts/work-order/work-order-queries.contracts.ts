import { ExternalWorkOrder, ExternalWorkOrderItem, Pagination } from '@shared';
import { ExternalWorkOrderStatusType as ExternalWorkOrderStatus } from '@input-type-schemas/ExternalWorkOrderStatusSchema';

/** Filter for finding work orders. */
export interface FindWorkOrdersFilter {
  clinicId: string;
  status?: ExternalWorkOrderStatus;
  supplierId?: string;
  patientId?: string;
  overdue?: boolean;
  dueBefore?: Date;
  pagination: Pagination;
}

/** External work order with items. */
export type ExternalWorkOrderWithItems = ExternalWorkOrder & {
  items: ExternalWorkOrderItem[];
};

/** Paginated work order results. */
export interface WorkOrderPage {
  items: ExternalWorkOrderWithItems[];
  total: number;
  pagination: Pagination;
}

/** Work order summary by status. */
export interface WorkOrderSummary {
  byStatus: Record<string, number>;
  overdueCount: number;
}

import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { WorkOrderItemSpecs } from '@shared/modules/work-order/schemas';

/** Props for a single work order item. */
export interface WorkOrderItemProps {
  /** Item description (required). */
  description: string;
  /** Quantity. */
  quantity: number;
  /** Unit cost. */
  unitCost?: number | null;
  /** Item specifications (JSON structure). */
  specs?: WorkOrderItemSpecs | null;
}

/** Props for creating a new external work order. */
export interface CreateExternalWorkOrderProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  /** Clinic ID (required). */
  clinicId: string;
  /** Organization ID (required). */
  organizationId: string;
  /** Supplier ID (required). */
  supplierId: string;
  /** Patient ID (optional). */
  patientId?: string | null;
  /** Treatment ID (optional). */
  treatmentId?: string | null;
  /** Provider ID (optional). */
  providerId?: string | null;
  /** Reference number for tracking. */
  referenceNo?: string | null;
  /** Due date. */
  dueDate?: Date | null;
  /** Agreed cost. */
  agreedCost?: number | null;
  /** Currency code. */
  currency?: CurrencyType;
  /** Optional note. */
  note?: string | null;
  /** User ID who created. */
  createdById?: string | null;
  /** Work order items (min 1). */
  items: WorkOrderItemProps[];
}

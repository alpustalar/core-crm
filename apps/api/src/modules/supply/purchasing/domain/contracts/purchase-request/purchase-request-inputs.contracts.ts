/** Props for a single purchase request item. */
export interface PurchaseRequestItemInput {
  /** Product ID (optional, can be free-text description). */
  productId?: string | null;
  /** Item description (required). */
  description: string;
  /** Quantity needed. */
  quantity: number;
  /** Estimated unit price. */
  estimatedUnitPrice?: number | null;
  /** Unit of measurement. */
  unit?: string | null;
}

/** Props for creating a new purchase request. */
export interface CreatePurchaseRequestProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  /** Clinic ID (required). */
  clinicId: string;
  /** Organization ID (required). */
  organizationId: string;
  /** User ID who requested (required). */
  requestedById: string;
  /** Needed by date. */
  neededBy?: Date | null;
  /** Optional note. */
  note?: string | null;
  /** Request items (min 1). */
  items: PurchaseRequestItemInput[];
}

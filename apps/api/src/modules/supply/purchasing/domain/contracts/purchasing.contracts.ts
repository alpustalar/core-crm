import { z } from 'zod';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { PurchaseRequestStatusSchema } from '@input-type-schemas/PurchaseRequestStatusSchema';
import { PurchaseOrderStatusSchema } from '@input-type-schemas/PurchaseOrderStatusSchema';
import { PurchaseOrderBillingStatusSchema } from '@input-type-schemas/PurchaseOrderBillingStatusSchema';
import { Pagination } from '@shared/common';
import { PurchaseRequest as IPurchaseRequest } from '@model-schema/PurchaseRequestSchema';
import { PurchaseRequestItem as IPurchaseRequestItem } from '@model-schema/PurchaseRequestItemSchema';
import { PurchaseOrder as IPurchaseOrder } from '@model-schema/PurchaseOrderSchema';
import { PurchaseOrderItem as IPurchaseOrderItem } from '@model-schema/PurchaseOrderItemSchema';

// ==========================================
// SATIN ALMA TALEBİ (PURCHASE REQUEST) — Props
// clinicId/organizationId/requestedById bağlamdan (actor) gelir.
// ==========================================

export const PurchaseRequestItemInputSchema = z.object({
  productId: z.uuid().nullable().optional(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  estimatedUnitPrice: z.number().nonnegative().nullable().optional(),
  unit: z.string().nullable().optional(),
});
export type PurchaseRequestItemInput = z.infer<
  typeof PurchaseRequestItemInputSchema
>;

export const CreatePurchaseRequestSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  requestedById: z.uuid(),
  neededBy: z.coerce.date().nullable().optional(),
  note: z.string().nullable().optional(),
  items: z.array(PurchaseRequestItemInputSchema).min(1),
});
export type CreatePurchaseRequestProps = z.infer<
  typeof CreatePurchaseRequestSchema
>;

// ==========================================
// SATIN ALMA SİPARİŞİ (PURCHASE ORDER) — Props
// ==========================================

export const PurchaseOrderItemInputSchema = z.object({
  productId: z.uuid().nullable().optional(),
  description: z.string().min(1),
  quantity: z.number().positive(), // sipariş edilen miktar
  unitPrice: z.number().nonnegative(),
  vatRate: z.number().int().min(0).max(100).optional(),
});
export type PurchaseOrderItemInput = z.infer<
  typeof PurchaseOrderItemInputSchema
>;

export const CreatePurchaseOrderSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  supplierId: z.uuid(),
  purchaseRequestId: z.uuid().nullable().optional(),
  orderDate: z.coerce.date().optional(),
  expectedDate: z.coerce.date().nullable().optional(),
  currency: CurrencySchema.optional(),
  note: z.string().nullable().optional(),
  items: z.array(PurchaseOrderItemInputSchema).min(1),
});
export type CreatePurchaseOrderProps = z.infer<
  typeof CreatePurchaseOrderSchema
>;

// Mal kabul — bir siparişin kalemlerinden teslim alınan miktarlar.
export const ReceivePurchaseOrderItemSchema = z.object({
  itemId: z.uuid(),
  quantity: z.number().positive(),
  lotNumber: z.string().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
});
export type ReceivePurchaseOrderItemInput = z.infer<
  typeof ReceivePurchaseOrderItemSchema
>;

// ==========================================
// Read-model filtreleri
// ==========================================

export const FindPurchaseRequestsFilterSchema = z.object({
  clinicId: z.uuid(),
  status: PurchaseRequestStatusSchema.optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindPurchaseRequestsFilter = z.infer<
  typeof FindPurchaseRequestsFilterSchema
>;

export const FindPurchaseOrdersFilterSchema = z.object({
  clinicId: z.uuid(),
  supplierId: z.uuid().optional(),
  status: PurchaseOrderStatusSchema.optional(),
  billingStatus: PurchaseOrderBillingStatusSchema.optional(),
  pagination: z.custom<Pagination>(
    (val) => val !== null && typeof val === 'object'
  ),
});
export type FindPurchaseOrdersFilter = z.infer<
  typeof FindPurchaseOrdersFilterSchema
>;

// ==========================================
// Persistence read-model'leri (header + items)
// ==========================================

export type PurchaseRequestWithItems = IPurchaseRequest & {
  items: IPurchaseRequestItem[];
};

export type PurchaseOrderWithItems = IPurchaseOrder & {
  items: IPurchaseOrderItem[];
};

import { Quantity } from '@src/domain/value-objects/quantity.vo';
import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { Money } from '@src/domain/value-objects/money.vo';
import { StockMovementTypeSchema } from '@input-type-schemas/StockMovementTypeSchema';
import { StockPurchasedEventPayload } from '@modules/supply/inventory/domain/events';
import {
  ProductConditionSchema,
  ProductUnitSchema,
  StockMovementDirectionSchema,
} from '@shared';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';

export const CreateStockMovementSchema = z.object({
  id: z.uuid().optional(),
  productId: z.uuid(),
  clinicId: z.uuid(),
  batchId: z.uuid().nullable().optional(),

  type: StockMovementTypeSchema,
  direction: StockMovementDirectionSchema,

  quantity: z.custom<number | Decimal>(),

  unitPrice: z
    .custom<Money>((val) => val instanceof Money)
    .nullable()
    .optional(),

  vatRate: z.number().nullable().optional(),

  financeLedgerId: z.uuid().nullable().optional(),
  performedById: z.uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type CreateStockMovementProps = z.infer<
  typeof CreateStockMovementSchema
>;
export const DeductQuantitySchema = z.object({
  qty: z.custom<Decimal | Quantity>(
    (val) => val instanceof Decimal || val instanceof Quantity
  ),
  performedById: z.uuid(),
  notes: z.string().nullable().optional(),
  movementType: StockMovementTypeSchema.optional(),
});

export type DeductQuantityProps = z.infer<typeof DeductQuantitySchema>;
export type AddQuantityProps = DeductQuantityProps;

export const CreateBatchFromPurchaseSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  supplierId: z.uuid().nullable(),
  lotNumber: z.string().nullable(),
  expiresAt: z.date().nullable(),

  quantity: z.custom<Quantity>((val) => val instanceof Quantity),
  purchasePrice: z.custom<Money>((val) => val instanceof Money),

  notes: z.string().nullable(),

  eventPayload:
    z.custom<
      Omit<
        StockPurchasedEventPayload,
        | 'batchId'
        | 'quantity'
        | 'unitPrice'
        | 'totalAmount'
        | 'productId'
        | 'clinicId'
        | 'organizationId'
        | 'supplierId'
      >
    >(),
});

export type CreateBatchFromPurchaseProps = z.infer<
  typeof CreateBatchFromPurchaseSchema
>;

// ==========================================
// 1. CREATE SUPPLIER SÖZLEŞME ŞEMASI (ZOD)
// ==========================================
export const CreateSupplierSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, 'Tedarikçi adı zorunludur'),
  contactName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.email('Geçersiz e-posta formatı').nullable().optional(),
  address: z.string().nullable().optional(),
  taxNumber: z.string().nullable().optional(),
  taxOffice: z.string().nullable().optional(),
  organizationId: z.uuid(),
});

// ==========================================
// 2. KATMAN SÖZLEŞME TİPİ (Şemadan Türeyen)
// ==========================================
export type CreateSupplierProps = z.infer<typeof CreateSupplierSchema>;

// ==========================================
// 1. PRODUCT CATEGORY SÖZLEŞMELERİ
// ==========================================

export const CreateProductCategorySchema = z.object({
  name: z.string().min(1, 'Kategori adı zorunludur'),
  organizationId: z.uuid(),
  parentId: z.uuid().nullable().optional(),
});
export type CreateProductCategoryProps = z.infer<
  typeof CreateProductCategorySchema
>;

// ==========================================
// 2. PRODUCT SÖZLEŞMELERİ
// ==========================================

export const CreateProductSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, 'Ürün adı zorunludur'),
  stockCode: z.string().min(1, 'Stok kodu zorunludur'),
  barcode: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),

  unit: ProductUnitSchema, // Orijinal enum/tip şeması
  condition: ProductConditionSchema.optional(),

  // Interface'deki gibi hem Value Object hem primitive sayı esnekliği:
  vatRate: z.custom<VatRate | number>(
    (val) => val instanceof VatRate || typeof val === 'number'
  ),
  criticalStockQty: z.custom<Quantity | number>(
    (val) => val instanceof Quantity || typeof val === 'number'
  ),
  reorderQty: z.custom<Quantity | number>(
    (val) => val instanceof Quantity || typeof val === 'number'
  ),

  organizationId: z.uuid(),
  categoryId: z.uuid().nullable().optional(),
  supplierId: z.uuid().nullable().optional(),
});
export type CreateProductProps = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  barcode: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  condition: ProductConditionSchema.optional(),
  unit: ProductUnitSchema.optional(),

  vatRate: z.custom<VatRate>((val) => val instanceof VatRate).optional(),
  criticalStockQty: z
    .custom<Quantity>((val) => val instanceof Quantity)
    .optional(),
  reorderQty: z.custom<Quantity>((val) => val instanceof Quantity).optional(),

  categoryId: z.uuid().nullable().optional(),
  supplierId: z.uuid().nullable().optional(),
});
export type UpdateProductProps = z.infer<typeof UpdateProductSchema>;

// ==========================================
// 3. SUPPLIER (TEDARİKÇİ) SÖZLEŞMELERİ
// ==========================================

export const UpdateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  contactName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.email('Geçersiz e-posta formatı').nullable().optional(),
  address: z.string().nullable().optional(),
  taxNumber: z.string().nullable().optional(),
  taxOffice: z.string().nullable().optional(),
});
export type UpdateSupplierProps = z.infer<typeof UpdateSupplierSchema>;

// ==========================================
// 4. READ-MODEL & QUERY RESPONSE SÖZLEŞMELERİ
// ==========================================

export const StockLevelSchema = z.object({
  productId: z.uuid(),
  productName: z.string(),
  stockCode: z.string(),
  clinicId: z.uuid(),
  totalQuantity: z.string(),
  criticalStockQty: z.string(),
  isBelowCritical: z.boolean(),
});
export type StockLevel = z.infer<typeof StockLevelSchema>;

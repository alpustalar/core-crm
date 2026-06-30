import {
  Product as IProduct,
  StockMovementDirectionSchema,
  StockMovementTypeSchema,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { randomUUID } from 'crypto';
import { ProductBatch } from '@modules/supply/inventory/domain/entities/product-batch.entity';
import { Decimal } from 'decimal.js';
import { ProductConditionType as ProductCondition } from '@input-type-schemas/ProductConditionSchema';
import { ProductUnitType as ProductUnit } from '@input-type-schemas/ProductUnitSchema';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';
import { Quantity } from '@src/domain/value-objects/quantity.vo';
import {
  CreateProductProps,
  CreateStockMovementProps,
  UpdateProductProps,
} from '@modules/supply/inventory/domain/supply.contracts';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Barcode } from '@src/domain/value-objects/barcode.vo';

export class Product extends AggregateRoot {
  constructor(data: IProduct) {
    super();
    this._id = UUID.create(data.id).orThrow();
    this._name = data.name;
    this._stockCode = data.stockCode;
    this._barcode = Barcode.create(data.barcode).instance ?? null;
    this._brand = data.brand;
    this._description = data.description;
    this._imageUrl = data.imageUrl;
    this._unit = data.unit;
    this._condition = data.condition;
    this._vatRate = VatRate.create(data.vatRate).orThrow();
    this._criticalStockQty = Quantity.create(data.criticalStockQty).orThrow();
    this._reorderQty = Quantity.create(data.reorderQty).orThrow();
    this._organizationId = UUID.create(data.organizationId).orThrow();
    this._categoryId = UUID.create(data.categoryId).instance ?? null;
    this._supplierId = UUID.create(data.supplierId).instance ?? null;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._deletedAt = data.deletedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _name: string;
  get name(): string {
    return this._name;
  }

  private _stockCode: string;
  get stockCode(): string {
    return this._stockCode;
  }

  private _barcode: Barcode | null;
  get barcode(): Barcode | null {
    return this._barcode;
  }

  private _brand: string | null;
  get brand(): string | null {
    return this._brand;
  }

  private _description: string | null;
  get description(): string | null {
    return this._description;
  }

  private _imageUrl: string | null;
  get imageUrl(): string | null {
    return this._imageUrl;
  }

  private _unit: ProductUnit;
  get unit(): ProductUnit {
    return this._unit;
  }

  private _condition: ProductCondition | null;
  get condition(): ProductCondition | null {
    return this._condition;
  }

  private _vatRate: VatRate;
  get vatRate(): VatRate {
    return this._vatRate;
  }

  private _criticalStockQty: Quantity;
  get criticalStockQty(): Quantity {
    return this._criticalStockQty;
  }

  private _reorderQty: Quantity;
  get reorderQty(): Quantity {
    return this._reorderQty;
  }

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
  }

  private _categoryId: UUID | null;
  get categoryId(): UUID | null {
    return this._categoryId;
  }

  private _supplierId: UUID | null;
  get supplierId(): UUID | null {
    return this._supplierId;
  }

  private _isActive: boolean;
  get isActive(): boolean {
    return this._isActive;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  private _deletedAt: Date | null;
  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get isDeleted(): boolean {
    return !!this._deletedAt;
  }

  /**
   * Domain kurallarına uygun olarak yeni bir Ürün (Aggregate) oluşturur.
   */
  public static create(props: CreateProductProps): Product {
    const vatRate =
      typeof props.vatRate === 'number'
        ? VatRate.create(props.vatRate).orThrow()
        : props.vatRate;

    const criticalStock =
      typeof props.criticalStockQty === 'number'
        ? Quantity.create(props.criticalStockQty).orThrow()
        : props.criticalStockQty;

    const reorderQty =
      typeof props.reorderQty === 'number'
        ? Quantity.create(props.reorderQty).orThrow()
        : props.reorderQty;

    vatRate.validate.hasTax.orThrow();
    const now = new Date();

    return new Product({
      id: props.id ?? randomUUID(),
      name: props.name.trim(),
      stockCode: props.stockCode.trim().toUpperCase(),
      barcode: props.barcode ?? null,
      brand: props.brand ?? null,
      description: props.description ?? null,
      imageUrl: props.imageUrl ?? null,
      unit: props.unit,
      condition: props.condition ?? null,
      vatRate: vatRate.value,
      criticalStockQty: criticalStock.value,
      reorderQty: reorderQty.value,
      organizationId: props.organizationId,
      categoryId: props.categoryId ?? null,
      supplierId: props.supplierId ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  public activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  public update(props: UpdateProductProps): void {
    if (props.name !== undefined) {
      if (!props.name || props.name.trim().length === 0)
        throw new Error('Ürün ismi boş olamaz..');
      this._name = props.name.trim();
    }
    if (props.barcode)
      this._barcode = Barcode.create(props.barcode).instance ?? null;
    if (props.brand !== undefined) this._brand = props.brand;
    if (props.description !== undefined) this._description = props.description;
    if (props.imageUrl !== undefined) this._imageUrl = props.imageUrl;
    if (props.unit !== undefined) this._unit = props.unit;
    if (props.vatRate !== undefined) {
      props.vatRate.validate.hasTax.orThrow();
      this._vatRate = props.vatRate;
    }
    if (props.criticalStockQty !== undefined) {
      this._criticalStockQty = props.criticalStockQty;
    }
    if (props.reorderQty !== undefined) {
      this._reorderQty = props.reorderQty;
    }
    if (props.categoryId !== undefined)
      this._categoryId = UUID.create(props.categoryId).instance ?? null;
    if (props.supplierId !== undefined)
      this._supplierId = UUID.create(props.supplierId).instance ?? null;

    this._updatedAt = new Date();
  }

  public softDelete(): void {
    if (this._deletedAt) return;
    this._deletedAt = new Date();
    this._isActive = false;
    this._updatedAt = new Date();
  }

  public handleStockChange(props: {
    quantityDelta: Decimal | number;
    clinicId: string;
    availableBatches: ProductBatch[];
    explicitBatchId?: string | null;
    performedById: string;
    notes?: string | null;
  }): {
    updatedBatch: ProductBatch | null;
    stockMovementProps: CreateStockMovementProps;
  } {
    const isIncrease = Quantity.isDeltaAnIncrease(props.quantityDelta);
    const absQty = Quantity.createAbsFromDelta(props.quantityDelta);

    // 1. Eğer sistemde batch takibi yapılan bir ürünse batch bulmaya çalış
    let targetBatch: ProductBatch | null = null;
    if (props.explicitBatchId) {
      targetBatch =
        props.availableBatches.find(
          (b) => b.id.value === props.explicitBatchId
        ) || null;
    } else if (props.availableBatches.length > 0) {
      targetBatch = props.availableBatches[0];
    }

    if (!targetBatch && !isIncrease) {
      throw new Error('Düşüm yapılacak uygun bir lot/batch bulunamadı.');
    }

    let stockMovementProps: CreateStockMovementProps;

    if (targetBatch) {
      if (isIncrease) {
        stockMovementProps = targetBatch.addQuantity({
          qty: absQty,
          performedById: props.performedById,
          notes: props.notes,
        });
      } else {
        stockMovementProps = targetBatch.deductQuantity({
          qty: absQty,
          performedById: props.performedById,
          notes: props.notes,
        });
      }
    } else {
      stockMovementProps = {
        productId: this._id.value,
        clinicId: props.clinicId,
        batchId: null,
        type: StockMovementTypeSchema.enum.ADJUSTMENT,
        direction: StockMovementDirectionSchema.enum.IN,
        quantity: absQty.value,
        performedById: props.performedById,
        notes: props.notes ?? 'Batch bağımsız stok girişi yapıldı.',
      };
    }

    return {
      updatedBatch: targetBatch,
      stockMovementProps,
    };
  }

  toPersistence(): IProduct {
    return {
      id: this._id.value,
      name: this._name,
      stockCode: this._stockCode,
      barcode: this._barcode?.value ?? null,
      brand: this._brand,
      description: this._description,
      imageUrl: this._imageUrl,
      unit: this._unit,
      condition: this._condition,
      vatRate: this._vatRate.value,
      criticalStockQty: this._criticalStockQty.value,
      reorderQty: this._reorderQty.value,
      organizationId: this._organizationId.value,
      categoryId: this._categoryId?.value ?? null,
      supplierId: this._supplierId?.value ?? null,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
    };
  }
}

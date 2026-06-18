import {
  Product as IProduct,
  StockMovementDirectionSchema,
  StockMovementTypeSchema,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { randomUUID } from 'crypto';
import { CreateStockMovementProps } from '@modules/supply/inventory/domain/types/create-stock-movement.props';
import { ProductBatch } from '@modules/supply/inventory/domain/entities/product-batch.entity';
import { Decimal } from 'decimal.js';
import { ProductConditionType as ProductCondition } from '@input-type-schemas/ProductConditionSchema';
import { ProductUnitType as ProductUnit } from '@input-type-schemas/ProductUnitSchema';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';

export interface CreateProductProps {
  name: string;
  stockCode: string;
  barcode?: string | null;
  brand?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  unit: ProductUnit;
  condition?: ProductCondition;
  vatRate: Decimal | number;
  criticalStockQty: Decimal | number;
  reorderQty: Decimal | number;
  organizationId: string;
  categoryId?: string | null;
  supplierId?: string | null;
}

export class Product extends AggregateRoot {
  constructor(data: IProduct) {
    super();
    this._id = data.id;
    this._name = data.name;
    this._stockCode = data.stockCode;
    this._barcode = data.barcode;
    this._brand = data.brand;
    this._description = data.description;
    this._imageUrl = data.imageUrl;
    this._unit = data.unit;
    this._condition = data.condition;
    this._vatRate = VatRate.create(data.vatRate);
    this._criticalStockQty = data.criticalStockQty;
    this._reorderQty = data.reorderQty;
    this._organizationId = data.organizationId;
    this._categoryId = data.categoryId;
    this._supplierId = data.supplierId;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._deletedAt = data.deletedAt;
  }

  private _id: string;
  get id(): string {
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

  private _barcode: string | null;
  get barcode(): string | null {
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

  private _criticalStockQty: Decimal;
  get criticalStockQty(): Decimal {
    return this._criticalStockQty;
  }

  private _reorderQty: Decimal;
  get reorderQty(): Decimal {
    return this._reorderQty;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _categoryId: string | null;
  get categoryId(): string | null {
    return this._categoryId;
  }

  private _supplierId: string | null;
  get supplierId(): string | null {
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
    const vatRateDecimal = new Decimal(props.vatRate);
    const criticalStockDecimal = new Decimal(props.criticalStockQty);
    const reorderDecimal = new Decimal(props.reorderQty);

    if (vatRateDecimal.isNegative())
      throw new Error('KDV oranı negatif olamaz.');
    if (criticalStockDecimal.isNegative())
      throw new Error('Kritik stok değeri negatif olamaz.');
    if (reorderDecimal.isNegative())
      throw new Error('Sipariş yenileme miktarı negatif olamaz.');

    const now = new Date();

    return new Product({
      id: randomUUID(),
      name: props.name.trim(),
      stockCode: props.stockCode.trim().toUpperCase(), // Stok kodları standart olarak büyük harf tutulur
      barcode: props.barcode ?? null,
      brand: props.brand ?? null,
      description: props.description ?? null,
      imageUrl: props.imageUrl ?? null,
      unit: props.unit,
      condition: props.condition ?? null,
      vatRate: vatRateDecimal,
      criticalStockQty: criticalStockDecimal,
      reorderQty: reorderDecimal,
      organizationId: props.organizationId,
      categoryId: props.categoryId ?? null,
      supplierId: props.supplierId ?? null,
      isActive: true, // Yeni açılan ürün varsayılan olarak aktiftir
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

  public update(
    props: Partial<{
      name: string;
      barcode: string | null;
      brand: string | null;
      description: string | null;
      imageUrl: string | null;
      unit: ProductUnit;
      vatRate: Decimal;
      criticalStockQty: Decimal;
      reorderQty: Decimal;
      categoryId: string | null;
      supplierId: string | null;
    }>
  ): void {
    if (props.name !== undefined) {
      if (!props.name || props.name.trim().length === 0)
        throw new Error('Ürün ismi boş olamaz..');
      this._name = props.name.trim();
    }
    if (props.barcode !== undefined) this._barcode = props.barcode;
    if (props.brand !== undefined) this._brand = props.brand;
    if (props.description !== undefined) this._description = props.description;
    if (props.imageUrl !== undefined) this._imageUrl = props.imageUrl;
    if (props.unit !== undefined) this._unit = props.unit;
    if (props.vatRate !== undefined) {
      if (props.vatRate.isNegative())
        throw new Error('KDV oranı negatif olamaz.');
      this._vatRate = VatRate.create(props.vatRate);
    }
    if (props.criticalStockQty !== undefined) {
      if (props.criticalStockQty.isNegative())
        throw new Error('Kritik stok miktarı negatif olamaz.');
      this._criticalStockQty = props.criticalStockQty;
    }
    if (props.reorderQty !== undefined) {
      if (props.reorderQty.isNegative())
        throw new Error('Sipariş yenileme miktarı negatif olamaz.');
      this._reorderQty = props.reorderQty;
    }
    if (props.categoryId !== undefined) this._categoryId = props.categoryId;
    if (props.supplierId !== undefined) this._supplierId = props.supplierId;

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
    const delta = new Decimal(props.quantityDelta);
    const isIncrease = delta.greaterThan(0);
    const absQty = delta.abs();

    // 1. Eğer sistemde batch takibi yapılan bir ürünse batch bulmaya çalış
    let targetBatch: ProductBatch | null = null;
    if (props.explicitBatchId) {
      targetBatch =
        props.availableBatches.find((b) => b.id === props.explicitBatchId) ||
        null;
    } else if (props.availableBatches.length > 0) {
      targetBatch = props.availableBatches[0];
    }

    // 2. KORUMA: Düşüm yapılmak isteniyor ama eldeki batch'lerin hiçbiri yetmiyorsa veya batch yoksa
    if (!targetBatch && !isIncrease) {
      throw new Error('Düşüm yapılacak uygun bir lot/batch bulunamadı.');
    }

    let stockMovementProps: CreateStockMovementProps;

    // 3. EĞER BATCH VARSA: İşlemi batch'e yaptır ve props'u al
    if (targetBatch) {
      if (isIncrease) {
        stockMovementProps = targetBatch.addQuantity(
          absQty,
          props.performedById,
          props.notes
        );
      } else {
        stockMovementProps = targetBatch.deductQuantity(
          absQty,
          props.performedById,
          props.notes
        );
      }
    } else {
      // 4. EĞER BATCH YOKSA (Düz Stok Girişi): Doğrudan hareket reçetesini burada el yapımı kur
      stockMovementProps = {
        productId: this._id,
        clinicId: props.clinicId,
        batchId: null,
        type: StockMovementTypeSchema.enum.ADJUSTMENT,
        direction: StockMovementDirectionSchema.enum.IN,
        quantity: absQty,
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
      id: this._id,
      name: this._name,
      stockCode: this._stockCode,
      barcode: this._barcode,
      brand: this._brand,
      description: this._description,
      imageUrl: this._imageUrl,
      unit: this._unit,
      condition: this._condition,
      vatRate: this._vatRate.value,
      criticalStockQty: this._criticalStockQty,
      reorderQty: this._reorderQty,
      organizationId: this._organizationId,
      categoryId: this._categoryId,
      supplierId: this._supplierId,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
    };
  }
}

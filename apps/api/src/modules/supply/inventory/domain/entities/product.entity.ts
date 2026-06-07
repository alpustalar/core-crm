import {
  Product as PrismaProduct,
  ProductCondition,
  ProductUnit,
} from '@prisma/client';
import { Prisma } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';

export class Product extends AggregateRoot implements PrismaProduct {
  constructor(data: PrismaProduct) {
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
    this._vatRate = data.vatRate;
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
  get id(): string { return this._id; }

  private _name: string;
  get name(): string { return this._name; }

  private _stockCode: string;
  get stockCode(): string { return this._stockCode; }

  private _barcode: string | null;
  get barcode(): string | null { return this._barcode; }

  private _brand: string | null;
  get brand(): string | null { return this._brand; }

  private _description: string | null;
  get description(): string | null { return this._description; }

  private _imageUrl: string | null;
  get imageUrl(): string | null { return this._imageUrl; }

  private _unit: ProductUnit;
  get unit(): ProductUnit { return this._unit; }

  private _condition: ProductCondition;
  get condition(): ProductCondition { return this._condition; }

  private _vatRate: Prisma.Decimal;
  get vatRate(): Prisma.Decimal { return this._vatRate; }

  private _criticalStockQty: Prisma.Decimal;
  get criticalStockQty(): Prisma.Decimal { return this._criticalStockQty; }

  private _reorderQty: Prisma.Decimal;
  get reorderQty(): Prisma.Decimal { return this._reorderQty; }

  private _organizationId: string;
  get organizationId(): string { return this._organizationId; }

  private _categoryId: string | null;
  get categoryId(): string | null { return this._categoryId; }

  private _supplierId: string | null;
  get supplierId(): string | null { return this._supplierId; }

  private _isActive: boolean;
  get isActive(): boolean { return this._isActive; }

  private _createdAt: Date;
  get createdAt(): Date { return this._createdAt; }

  private _updatedAt: Date;
  get updatedAt(): Date { return this._updatedAt; }

  private _deletedAt: Date | null;
  get deletedAt(): Date | null { return this._deletedAt; }

  get isDeleted(): boolean {
    return !!this._deletedAt;
  }

  public activate(): void {
    this._isActive = true;
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public update(props: Partial<{
    name: string;
    barcode: string | null;
    brand: string | null;
    description: string | null;
    unit: ProductUnit;
    vatRate: Prisma.Decimal;
    criticalStockQty: Prisma.Decimal;
    reorderQty: Prisma.Decimal;
    categoryId: string | null;
    supplierId: string | null;
  }>): void {
    if (props.name !== undefined) this._name = props.name;
    if (props.barcode !== undefined) this._barcode = props.barcode;
    if (props.brand !== undefined) this._brand = props.brand;
    if (props.description !== undefined) this._description = props.description;
    if (props.unit !== undefined) this._unit = props.unit;
    if (props.vatRate !== undefined) this._vatRate = props.vatRate;
    if (props.criticalStockQty !== undefined) this._criticalStockQty = props.criticalStockQty;
    if (props.reorderQty !== undefined) this._reorderQty = props.reorderQty;
    if (props.categoryId !== undefined) this._categoryId = props.categoryId;
    if (props.supplierId !== undefined) this._supplierId = props.supplierId;
  }

  public softDelete(): void {
    if (this._deletedAt) return;
    this._deletedAt = new Date();
    this._isActive = false;
  }

  toPersistence(): PrismaProduct {
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
      vatRate: this._vatRate,
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

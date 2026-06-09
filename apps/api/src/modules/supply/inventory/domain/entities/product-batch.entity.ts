import {
  Prisma,
  ProductBatch as PrismaProductBatch,
  StockMovementDirection,
  StockMovementType,
} from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';
import {
  StockPurchasedEvent,
  StockPurchasedEventPayload,
} from '../events/stock-purchased.event';
import { CreateStockMovementProps } from '@modules/supply/inventory/domain/types/create-stock-movement.props';

export interface CreateBatchFromPurchaseProps {
  id: string;
  productId: string;
  clinicId: string;
  organizationId: string;
  supplierId: string | null;
  lotNumber: string | null;
  expiresAt: Date | null;
  quantity: Prisma.Decimal;
  purchasePrice: Prisma.Decimal;
  currency: string;
  notes: string | null;
  eventPayload: Omit<
    StockPurchasedEventPayload,
    | 'batchId'
    | 'quantity'
    | 'unitPrice'
    | 'totalAmount'
    | 'productId'
    | 'clinicId'
    | 'organizationId'
    | 'supplierId'
  >;
}

export class ProductBatch extends AggregateRoot implements PrismaProductBatch {
  constructor(data: PrismaProductBatch) {
    super();
    this._id = data.id;
    this._productId = data.productId;
    this._clinicId = data.clinicId;
    this._supplierId = data.supplierId;
    this._lotNumber = data.lotNumber;
    this._expiresAt = data.expiresAt;
    this._quantity = data.quantity;
    this._purchasePrice = data.purchasePrice;
    this._currency = data.currency;
    this._receivedAt = data.receivedAt;
    this._notes = data.notes;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _productId: string;
  get productId(): string {
    return this._productId;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _supplierId: string | null;
  get supplierId(): string | null {
    return this._supplierId;
  }

  private _lotNumber: string | null;
  get lotNumber(): string | null {
    return this._lotNumber;
  }

  private _expiresAt: Date | null;
  get expiresAt(): Date | null {
    return this._expiresAt;
  }

  private _quantity: Prisma.Decimal;
  get quantity(): Prisma.Decimal {
    return this._quantity;
  }

  private _purchasePrice: Prisma.Decimal;
  get purchasePrice(): Prisma.Decimal {
    return this._purchasePrice;
  }

  private _currency: string;
  get currency(): string {
    return this._currency;
  }

  private _receivedAt: Date;
  get receivedAt(): Date {
    return this._receivedAt;
  }

  private _notes: string | null;
  get notes(): string | null {
    return this._notes;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date;
  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static createFromPurchase(
    props: CreateBatchFromPurchaseProps
  ): ProductBatch {
    const totalAmount = props.purchasePrice.times(props.quantity);

    const batch = new ProductBatch({
      id: props.id,
      productId: props.productId,
      clinicId: props.clinicId,
      supplierId: props.supplierId,
      lotNumber: props.lotNumber,
      expiresAt: props.expiresAt,
      quantity: props.quantity,
      purchasePrice: props.purchasePrice,
      currency: props.currency,
      receivedAt: new Date(),
      notes: props.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    batch.addDomainEvent(
      new StockPurchasedEvent({
        ...props.eventPayload,
        batchId: props.id,
        productId: props.productId,
        clinicId: props.clinicId,
        organizationId: props.organizationId,
        supplierId: props.supplierId,
        quantity: props.quantity.toString(),
        unitPrice: props.purchasePrice.toString(),
        totalAmount: totalAmount.toString(),
      })
    );

    return batch;
  }

  public deductQuantity(
    qty: Prisma.Decimal,
    performedById: string,
    notes?: string | null
  ): CreateStockMovementProps {
    if (this._quantity.lessThan(qty)) {
      throw new Error(
        `Yetersiz stok. Mevcut: ${Number(this._quantity)}, İstenen: ${Number(qty)}`
      );
    }

    this._quantity = this._quantity.minus(qty);

    return {
      productId: this._productId,
      clinicId: this._clinicId,
      batchId: this._id,
      type: StockMovementType.ADJUSTMENT,
      direction: StockMovementDirection.OUT,
      quantity: qty,
      performedById,
      notes: notes ?? 'Batch üzerinden stok düşümü yapıldı.',
    };
  }

  public addQuantity(
    qty: Prisma.Decimal,
    performedById: string,
    notes?: string | null
  ): CreateStockMovementProps {
    if (qty.lessThanOrEqualTo(0)) {
      throw new Error('Eklenecek stok miktarı sıfırdan büyük olmalıdır.');
    }

    this._quantity = this._quantity.plus(qty);

    return {
      productId: this._productId,
      clinicId: this._clinicId,
      batchId: this._id,
      type: StockMovementType.ADJUSTMENT,
      direction: StockMovementDirection.IN,
      quantity: qty,
      performedById,
      notes: notes ?? 'Batch üzerinden stok artırımı yapıldı.',
    };
  }

  toPersistence(): PrismaProductBatch {
    return {
      id: this._id,
      productId: this._productId,
      clinicId: this._clinicId,
      supplierId: this._supplierId,
      lotNumber: this._lotNumber,
      expiresAt: this._expiresAt,
      quantity: this._quantity,
      purchasePrice: this._purchasePrice,
      currency: this._currency,
      receivedAt: this._receivedAt,
      notes: this._notes,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

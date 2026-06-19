import {
  ProductBatch as IProductBatch,
  StockMovementDirectionSchema,
  StockMovementTypeSchema,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { StockPurchasedEvent } from '../events/stock-purchased.event';
import { Money } from '@src/domain/value-objects/money.vo';
import { Quantity } from '@src/domain/value-objects/quantity.vo';
import {
  AddQuantityProps,
  CreateBatchFromPurchaseProps,
  CreateStockMovementProps,
  DeductQuantityProps,
} from '@modules/supply/inventory/domain/supply.contracts';

export class ProductBatch extends AggregateRoot {
  constructor(data: IProductBatch) {
    super();
    this._id = data.id;
    this._productId = data.productId;
    this._clinicId = data.clinicId;
    this._supplierId = data.supplierId;
    this._lotNumber = data.lotNumber;
    this._expiresAt = data.expiresAt;
    this._quantity = Quantity.create(data.quantity);

    this._purchasePrice = Money.create(data.purchasePrice, data.currency);

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

  private _quantity: Quantity;
  get quantity(): Quantity {
    return this._quantity;
  }

  private _purchasePrice: Money;
  get purchasePrice(): Money {
    return this._purchasePrice;
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
    if (props.expiresAt && props.expiresAt <= new Date()) {
      throw new Error(
        '[Stok Disiplini] Son kullanma tarihi geçmiş bir ürün partisi (batch) oluşturulamaz.'
      );
    }

    const quantityDecimal = props.quantity.value;
    const totalAmount = props.purchasePrice.multiply(quantityDecimal);

    const batch = new ProductBatch({
      id: props.id,
      productId: props.productId,
      clinicId: props.clinicId,
      supplierId: props.supplierId,
      lotNumber: props.lotNumber,
      expiresAt: props.expiresAt,
      quantity: quantityDecimal,
      purchasePrice: props.purchasePrice.amount,
      currency: props.purchasePrice.currency,
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
        quantity: quantityDecimal.toString(),
        unitPrice: props.purchasePrice.amount.toString(),
        totalAmount: totalAmount.amount.toString(),
      })
    );

    return batch;
  }

  public deductQuantity({
    qty,
    movementType = StockMovementTypeSchema.enum.ADJUSTMENT,
    performedById,
    notes,
  }: DeductQuantityProps): CreateStockMovementProps {
    const incomingQuantity =
      qty instanceof Quantity
        ? qty
        : Quantity.createPositive(qty, 'Stok düşüm');

    incomingQuantity.validateGreaterThanZeroOrThrow();

    this._quantity = this._quantity.sub(incomingQuantity);
    this._updatedAt = new Date();

    return {
      productId: this._productId,
      clinicId: this._clinicId,
      batchId: this._id,
      type: movementType,
      direction: StockMovementDirectionSchema.enum.OUT,
      quantity: incomingQuantity.value,
      performedById,
      notes: notes ?? 'Batch üzerinden stok düşümü yapıldı.',
    };
  }

  public addQuantity({
    qty,
    movementType = StockMovementTypeSchema.enum.ADJUSTMENT,
    performedById,
    notes,
  }: AddQuantityProps): CreateStockMovementProps {
    const incomingQuantity =
      qty instanceof Quantity
        ? qty
        : Quantity.createPositive(qty, 'Stok giriş');

    incomingQuantity.validateGreaterThanZeroOrThrow();

    this._quantity = this._quantity.add(incomingQuantity);
    this._updatedAt = new Date();

    return {
      productId: this._productId,
      clinicId: this._clinicId,
      batchId: this._id,
      type: movementType,
      direction: StockMovementDirectionSchema.enum.IN,
      quantity: incomingQuantity.value,
      performedById,
      notes: notes ?? 'Batch üzerinden stok artırımı yapıldı.',
    };
  }
  toPersistence(): IProductBatch {
    return {
      id: this._id,
      productId: this._productId,
      clinicId: this._clinicId,
      supplierId: this._supplierId,
      lotNumber: this._lotNumber,
      expiresAt: this._expiresAt,
      quantity: this._quantity.value,
      purchasePrice: this._purchasePrice.amount,
      currency: this._purchasePrice.currency,
      receivedAt: this._receivedAt,
      notes: this._notes,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

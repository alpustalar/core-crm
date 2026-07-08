import {
  ProductBatch as IProductBatch,
  StockMovementDirectionSchema,
  StockMovementTypeSchema,
} from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { StockPurchasedEvent } from '../events/stock-purchased.event';
import { Money } from '@src/domain/value-objects/money.vo';
import { Quantity } from '@src/domain/value-objects/quantity.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import {
  AddQuantityProps,
  CreateBatchFromPurchaseProps,
  DeductQuantityProps,
} from '@modules/supply/inventory/domain/contracts/product-batch.contracts';
import { CreateStockMovementProps } from '@modules/supply/inventory/domain/contracts/stock-movement.contracts';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

export class ProductBatch extends AggregateRoot {
  constructor(data: IProductBatch) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._productId = UUID.fromTrusted(data.productId);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._supplierId = UUID.create(data.supplierId).instance ?? null;
    this._lotNumber = data.lotNumber;
    this._expiresAt = data.expiresAt;
    this._quantity = Quantity.fromTrusted(data.quantity);
    this._purchasePrice = Money.fromTrusted(data.purchasePrice, data.currency);
    this._receivedAt = data.receivedAt;
    this._notes = data.notes;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _productId: UUID;
  get productId(): UUID {
    return this._productId;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
    return this._clinicId;
  }

  private _supplierId: UUID | null;
  get supplierId(): UUID | null {
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
    if (props.expiresAt && props.expiresAt <= DateTimeManager.create()) {
      throw new Error(
        '[Stok Disiplini] Son kullanma tarihi geçmiş bir ürün partisi (batch) oluşturulamaz.'
      );
    }

    const totalAmount = props.purchasePrice.multiply(props.quantity.value);

    const batchId = props.id
      ? UUID.create(props.id).orThrow()
      : UUID.generate();

    const batch = new ProductBatch({
      id: batchId.value,
      productId: UUID.create(props.productId).orThrow().value,
      clinicId: UUID.create(props.clinicId).orThrow().value,
      supplierId: UUID.create(props.supplierId).orThrow().value,
      lotNumber: props.lotNumber,
      expiresAt: props.expiresAt,
      quantity: props.quantity.value,
      purchasePrice: props.purchasePrice.amount,
      currency: props.purchasePrice.currency,
      receivedAt: DateTimeManager.create(),
      notes: props.notes,
      createdAt: DateTimeManager.create(),
      updatedAt: DateTimeManager.create(),
    });

    batch.addDomainEvent(
      new StockPurchasedEvent({
        ...props.eventPayload,
        batchId: batchId.value,
        productId: props.productId,
        clinicId: props.clinicId,
        organizationId: props.organizationId,
        supplierId: props.supplierId,
        quantity: props.quantity.value.toString(),
        unitPrice: props.purchasePrice.amount.toString(),
        totalAmount: totalAmount.amount.toString(),
      })
    );

    return batch;
  }

  // TODO: burası event driven olacak. geriye hiçbir şey dönülmeyecek
  public deductQuantity({
    qty,
    movementType = StockMovementTypeSchema.enum.ADJUSTMENT,
    performedById,
    notes,
  }: DeductQuantityProps): CreateStockMovementProps {
    const incomingQuantity =
      qty instanceof Quantity
        ? qty
        : Quantity.createPositive(qty, 'Stok düşüm').orThrow();

    incomingQuantity.validate.greaterThanZero.orThrow();

    this._quantity = this._quantity.sub(incomingQuantity);
    this._updatedAt = DateTimeManager.create();

    return {
      productId: this.productId.value,
      clinicId: this.clinicId.value,
      batchId: this.id.value,
      type: movementType,
      direction: StockMovementDirectionSchema.enum.OUT,
      quantity: incomingQuantity.value,
      performedById,
      notes: notes ?? 'Batch üzerinden stok düşümü yapıldı.',
    };
  }

  // TODO: burası event driven olacak. geriye hiçbir şey dönülmeyecek
  public addQuantity({
    qty,
    movementType = StockMovementTypeSchema.enum.ADJUSTMENT,
    performedById,
    notes,
  }: AddQuantityProps): CreateStockMovementProps {
    const incomingQuantity =
      qty instanceof Quantity
        ? qty
        : Quantity.createPositive(qty, 'Stok giriş').orThrow();

    incomingQuantity.validate.greaterThanZero.orThrow();

    this._quantity = this._quantity.add(incomingQuantity);
    this._updatedAt = DateTimeManager.create();

    return {
      productId: this._productId.value,
      clinicId: this._clinicId.value,
      batchId: this._id.value,
      type: movementType,
      direction: StockMovementDirectionSchema.enum.IN,
      quantity: incomingQuantity.value,
      performedById,
      notes: notes ?? 'Batch üzerinden stok artırımı yapıldı.',
    };
  }
  toPersistence(): IProductBatch {
    return {
      id: this.id.value,
      productId: this.productId.value,
      clinicId: this.clinicId.value,
      supplierId: this.supplierId?.value ?? null,
      lotNumber: this.lotNumber,
      expiresAt: this.expiresAt,
      quantity: this.quantity.value,
      purchasePrice: this.purchasePrice.amount,
      currency: this.purchasePrice.currency,
      receivedAt: this.receivedAt,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

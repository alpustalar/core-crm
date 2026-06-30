import { StockMovement as IStockMovement } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { StockMovementTypeType as StockMovementType } from '@input-type-schemas/StockMovementTypeSchema';
import { StockMovementDirectionType as StockMovementDirection } from '@input-type-schemas/StockMovementDirectionSchema';
import { Money } from '@src/domain/value-objects/money.vo';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { Quantity } from '@src/domain/value-objects/quantity.vo';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';
import { CreateStockMovementProps } from '@modules/supply/inventory/domain/supply.contracts';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { UUID } from '@src/domain/value-objects/uuid.vo';

export class StockMovement extends AggregateRoot {
  constructor(data: IStockMovement) {
    super();

    const currency = Currency.create(data.currency).orThrow();

    this._id = UUID.create(data.id).orThrow();
    this._productId = UUID.create(data.productId).orThrow();
    this._clinicId = UUID.create(data.clinicId).orThrow();
    this._batchId = UUID.create(data.batchId).instance ?? null;
    this._type = data.type;
    this._direction = data.direction;
    this._quantity = Quantity.create(data.quantity).orThrow();
    this._currency = currency;
    this._unitPrice =
      Money.create(data.unitPrice, currency.value).instance ?? null;
    this._vatRate = data.vatRate && VatRate.create(data?.vatRate).orThrow();
    this._vatAmount =
      Money.create(data.vatAmount, currency.value).instance ?? null;
    this._totalAmount =
      Money.create(data.totalAmount, currency.value).instance ?? null;
    this._financeLedgerId = UUID.create(data.financeLedgerId).instance ?? null;
    this._performedById = UUID.create(data.performedById).instance ?? null;
    this._notes = data.notes;
    this._createdAt = data.createdAt;
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

  private _batchId: UUID | null;

  get batchId(): UUID | null {
    return this._batchId;
  }

  private _type: StockMovementType;

  get type(): StockMovementType {
    return this._type;
  }

  private _direction: StockMovementDirection;

  get direction(): StockMovementDirection {
    return this._direction;
  }

  private _quantity: Quantity;

  get quantity(): Quantity {
    return this._quantity;
  }

  private _unitPrice: Money | null;

  get unitPrice(): Money | null {
    return this._unitPrice;
  }

  private _currency: Currency;

  get currency(): Currency {
    return this._currency;
  }

  private _vatRate: VatRate | null;

  get vatRate(): VatRate | null {
    return this._vatRate;
  }

  private _vatAmount: Money | null;

  get vatAmount(): Money | null {
    return this._vatAmount;
  }

  private _totalAmount: Money | null;

  get totalAmount(): Money | null {
    return this._totalAmount;
  }

  private _financeLedgerId: UUID | null;

  get financeLedgerId(): UUID | null {
    return this._financeLedgerId;
  }

  private _performedById: UUID | null;

  get performedById(): UUID | null {
    return this._performedById;
  }

  private _notes: string | null;

  get notes(): string | null {
    return this._notes;
  }

  private _createdAt: Date;

  get createdAt(): Date {
    return this._createdAt;
  }

  public static create(props: CreateStockMovementProps): StockMovement {
    const { quantity, unitPrice } = props;

    let vatAmount: Money | null = null;
    let totalAmount: Money | null = null;

    if (unitPrice) {
      const subTotal = unitPrice.multiply(quantity);
      vatAmount = subTotal.calculateVat(props.vatRate ?? 0);
      totalAmount = subTotal.add(vatAmount);
    }

    return new StockMovement({
      id: UUID.create(props.id).instance?.value ?? UUID.generate().value,
      productId: props.productId,
      clinicId: props.clinicId,
      batchId: props.batchId ?? null,
      type: props.type,
      direction: props.direction,
      quantity: Quantity.create(quantity).orThrow().value,
      unitPrice: unitPrice?.amount ?? null,
      currency: unitPrice?.currency ?? Currency.enum.TRY,
      vatRate: VatRate.create(props.vatRate).instance?.value ?? null,
      vatAmount: vatAmount?.amount ?? null,
      totalAmount: totalAmount?.amount ?? null,

      financeLedgerId: props.financeLedgerId ?? null,
      performedById: props.performedById ?? null,
      notes: props.notes ?? null,
      createdAt: DateTimeManager.create(),
    });
  }

  toPersistence(): IStockMovement {
    return {
      id: this._id.value,
      productId: this._productId.value,
      clinicId: this._clinicId.value,
      batchId: this._batchId?.value ?? null,
      type: this._type,
      direction: this._direction,
      quantity: this._quantity.value,
      unitPrice: this._unitPrice?.amount ?? null,
      currency: this._currency.value,
      vatRate: this._vatRate?.value ?? null,
      vatAmount: this._vatAmount?.amount ?? null,
      totalAmount: this._totalAmount?.amount ?? null,
      financeLedgerId: this._financeLedgerId?.value ?? null,
      performedById: this._performedById?.value ?? null,
      notes: this._notes,
      createdAt: this._createdAt,
    };
  }
}

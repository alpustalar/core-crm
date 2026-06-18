import { StockMovement as IStockMovement } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { randomUUID } from 'crypto';
import { CreateStockMovementProps } from '@modules/supply/inventory/domain/types/create-stock-movement.props';
import { StockMovementTypeType as StockMovementType } from '@input-type-schemas/StockMovementTypeSchema';
import { StockMovementDirectionType as StockMovementDirection } from '@input-type-schemas/StockMovementDirectionSchema';
import { Decimal } from 'decimal.js';
import { Money } from '@src/domain/value-objects/money.vo';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { Quantity } from '@src/domain/value-objects/quantity.vo';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';

export class StockMovement extends AggregateRoot {
  constructor(data: IStockMovement) {
    super();
    const unitPrice = data.unitPrice
      ? Money.create(data.unitPrice, data.currency)
      : null;
    const totalAmount = data.totalAmount
      ? Money.create(data.totalAmount, data.currency)
      : null;
    this._id = data.id;
    this._productId = data.productId;
    this._clinicId = data.clinicId;
    this._batchId = data.batchId;
    this._type = data.type;
    this._direction = data.direction;
    this._quantity = Quantity.create(data.quantity);
    this._unitPrice = unitPrice;
    this._currency = Currency.create(data.currency);
    this._vatRate = VatRate.create(data.vatRate) ?? null;
    this._totalAmount = totalAmount;
    this._financeLedgerId = data.financeLedgerId;
    this._performedById = data.performedById;
    this._notes = data.notes;
    this._createdAt = data.createdAt;
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

  private _batchId: string | null;

  get batchId(): string | null {
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

  private _financeLedgerId: string | null;

  get financeLedgerId(): string | null {
    return this._financeLedgerId;
  }

  private _performedById: string | null;

  get performedById(): string | null {
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
      id: props.id ?? randomUUID(),
      productId: props.productId,
      clinicId: props.clinicId,
      batchId: props.batchId ?? null,
      type: props.type,
      direction: props.direction,
      quantity: new Decimal(quantity),
      unitPrice: unitPrice?.amount ?? null,
      currency: unitPrice?.currency ?? 'TRY',

      vatRate: props.vatRate ? new Decimal(props.vatRate) : null,
      vatAmount: vatAmount?.amount ?? null,
      totalAmount: totalAmount?.amount ?? null,

      financeLedgerId: props.financeLedgerId ?? null,
      performedById: props.performedById ?? null,
      notes: props.notes ?? null,
      createdAt: new Date(),
    });
  }

  toPersistence(): IStockMovement {
    return {
      id: this._id,
      productId: this._productId,
      clinicId: this._clinicId,
      batchId: this._batchId,
      type: this._type,
      direction: this._direction,
      quantity: this._quantity.value,
      unitPrice: this._unitPrice?.amount ?? null,
      currency: this._currency.value,
      vatRate: this._vatRate?.value ?? null,
      vatAmount: this._vatAmount?.amount ?? null,
      totalAmount: this._totalAmount?.amount ?? null,
      financeLedgerId: this._financeLedgerId,
      performedById: this._performedById,
      notes: this._notes,
      createdAt: this._createdAt,
    };
  }
}

import {
  StockMovement as PrismaStockMovement,
  StockMovementDirection,
  StockMovementType,
} from '@prisma/client';
import { Prisma } from '@prisma/client';
import { AggregateRoot } from '@common/domain/aggregate-root';

export class StockMovement extends AggregateRoot implements PrismaStockMovement {
  constructor(data: PrismaStockMovement) {
    super();
    this._id = data.id;
    this._productId = data.productId;
    this._clinicId = data.clinicId;
    this._batchId = data.batchId;
    this._type = data.type;
    this._direction = data.direction;
    this._quantity = data.quantity;
    this._unitPrice = data.unitPrice;
    this._currency = data.currency;
    this._vatRate = data.vatRate;
    this._vatAmount = data.vatAmount;
    this._totalAmount = data.totalAmount;
    this._financeLedgerId = data.financeLedgerId;
    this._performedById = data.performedById;
    this._notes = data.notes;
    this._createdAt = data.createdAt;
  }

  private _id: string;
  get id(): string { return this._id; }

  private _productId: string;
  get productId(): string { return this._productId; }

  private _clinicId: string;
  get clinicId(): string { return this._clinicId; }

  private _batchId: string | null;
  get batchId(): string | null { return this._batchId; }

  private _type: StockMovementType;
  get type(): StockMovementType { return this._type; }

  private _direction: StockMovementDirection;
  get direction(): StockMovementDirection { return this._direction; }

  private _quantity: Prisma.Decimal;
  get quantity(): Prisma.Decimal { return this._quantity; }

  private _unitPrice: Prisma.Decimal | null;
  get unitPrice(): Prisma.Decimal | null { return this._unitPrice; }

  private _currency: string;
  get currency(): string { return this._currency; }

  private _vatRate: Prisma.Decimal | null;
  get vatRate(): Prisma.Decimal | null { return this._vatRate; }

  private _vatAmount: Prisma.Decimal | null;
  get vatAmount(): Prisma.Decimal | null { return this._vatAmount; }

  private _totalAmount: Prisma.Decimal | null;
  get totalAmount(): Prisma.Decimal | null { return this._totalAmount; }

  private _financeLedgerId: string | null;
  get financeLedgerId(): string | null { return this._financeLedgerId; }

  private _performedById: string | null;
  get performedById(): string | null { return this._performedById; }

  private _notes: string | null;
  get notes(): string | null { return this._notes; }

  private _createdAt: Date;
  get createdAt(): Date { return this._createdAt; }

  toPersistence(): PrismaStockMovement {
    return {
      id: this._id,
      productId: this._productId,
      clinicId: this._clinicId,
      batchId: this._batchId,
      type: this._type,
      direction: this._direction,
      quantity: this._quantity,
      unitPrice: this._unitPrice,
      currency: this._currency,
      vatRate: this._vatRate,
      vatAmount: this._vatAmount,
      totalAmount: this._totalAmount,
      financeLedgerId: this._financeLedgerId,
      performedById: this._performedById,
      notes: this._notes,
      createdAt: this._createdAt,
    };
  }
}

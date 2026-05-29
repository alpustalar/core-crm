import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { INVENTORY_EVENTS } from '@src/domain/constants/events';

export interface StockPurchasedEventPayload extends IAuditLog {
  readonly productId: string;
  readonly clinicId: string;
  readonly organizationId: string;
  readonly batchId: string;
  readonly quantity: string;
  readonly unitPrice: string;
  readonly totalAmount: string;
  readonly supplierId?: string | null;
}

export class StockPurchasedEvent extends BaseEvent {
  static readonly NAME = INVENTORY_EVENTS.STOCK_PURCHASED;

  public readonly productId: string;
  public readonly clinicId: string;
  public readonly organizationId: string;
  public readonly batchId: string;
  public readonly quantity: string;
  public readonly unitPrice: string;
  public readonly totalAmount: string;
  public readonly supplierId: string | null;

  constructor(payload: StockPurchasedEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.productId = payload.productId;
    this.clinicId = payload.clinicId;
    this.organizationId = payload.organizationId;
    this.batchId = payload.batchId;
    this.quantity = payload.quantity;
    this.unitPrice = payload.unitPrice;
    this.totalAmount = payload.totalAmount;
    this.supplierId = payload.supplierId ?? null;
  }
}

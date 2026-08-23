import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Decimal } from 'decimal.js';
import { StockQuantityChangedEvent } from '@modules/supply/inventory/domain/events';
import { StockMovement } from '@modules/supply/inventory/domain/entities/stock-movement.entity';
import {
  IStockMovementCommandRepository,
  STOCK_MOVEMENT_COMMAND_REPOSITORY,
} from '@modules/supply/inventory/domain/repositories/stock-movement/stock-movement.command.repository';

/**
 * Stok miktarı değiştiğinde hareket (StockMovement) kaydını yazar. Miktarı değiştiren
 * akış artık kaydı kendisi yazmaz; bu yan etki olay üzerinden yürür.
 *
 * Olay outbox'tan geldiği için teslim at-least-once'tır: aynı olay iki kez düşerse
 * hareket iki kez yazılmaz — id'yi olay taşır ve önce varlığı kontrol edilir.
 * Hata bilinçli olarak yutulmaz; outbox kaydı "işlendi" işaretlenmesin ve yeniden
 * denensin diye yukarı fırlatılır.
 */
@Injectable()
export class StockQuantityChangedListener {
  private readonly logger = new Logger(StockQuantityChangedListener.name);

  constructor(
    @Inject(STOCK_MOVEMENT_COMMAND_REPOSITORY)
    private readonly stockMovementRepo: IStockMovementCommandRepository
  ) {}

  @OnEvent(StockQuantityChangedEvent.NAME, { async: true })
  async handle(event: StockQuantityChangedEvent): Promise<void> {
    try {
      const existing = await this.stockMovementRepo.findById(event.movementId);
      if (existing) return;

      const movement = StockMovement.create({
        id: event.movementId,
        productId: event.productId,
        clinicId: event.clinicId,
        batchId: event.batchId,
        type: event.type,
        direction: event.direction,
        quantity: new Decimal(event.quantity),
        performedById: event.performedById,
        notes: event.notes,
      });

      await this.stockMovementRepo.create(movement);
    } catch (error) {
      this.logger.error(
        `Stok hareketi yazılamadı: movement=${event.movementId} product=${event.productId}`,
        error
      );
      throw error;
    }
  }
}

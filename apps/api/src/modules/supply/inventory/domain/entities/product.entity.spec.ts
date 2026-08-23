import { randomUUID } from 'crypto';
import { Decimal } from 'decimal.js';
import { Product } from './product.entity';
import { ProductBatch } from './product-batch.entity';
import { StockQuantityChangedEvent } from '@modules/supply/inventory/domain/events';
import { Product as IProduct, ProductBatch as IProductBatch } from '@shared';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

describe('Product.handleStockChange', () => {
  const clinicId = randomUUID();
  const performedById = randomUUID();

  const product = (): Product => {
    const now = DateTimeManager.create();
    return new Product({
      id: randomUUID(),
      clinicId,
      organizationId: randomUUID(),
      categoryId: null,
      supplierId: null,
      name: 'Anestezik solüsyon',
      stockCode: 'ANS-001',
      barcode: null,
      brand: null,
      description: null,
      imageUrl: null,
      unit: 'PIECE',
      condition: null,
      vatRate: new Decimal(20),
      criticalStockQty: new Decimal(5),
      reorderQty: new Decimal(10),
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    } as IProduct);
  };

  const batchOf = (productId: string, quantity: number): ProductBatch => {
    const now = DateTimeManager.create();
    return new ProductBatch({
      id: randomUUID(),
      productId,
      clinicId,
      supplierId: null,
      lotNumber: 'LOT-1',
      expiresAt: null,
      quantity: new Decimal(quantity),
      purchasePrice: new Decimal(100),
      currency: 'TRY',
      receivedAt: now,
      notes: null,
      createdAt: now,
      updatedAt: now,
    } as IProductBatch);
  };

  const changedEvents = (
    aggregate: Product | ProductBatch
  ): StockQuantityChangedEvent[] =>
    aggregate
      .getDomainEvents()
      .filter(
        (e): e is StockQuantityChangedEvent =>
          e instanceof StockQuantityChangedEvent
      );

  it('artışta partiyi döner; olayı parti taşır, ürün taşımaz', () => {
    const item = product();
    const batch = batchOf(item.id.value, 10);

    const updated = item.handleStockChange({
      quantityDelta: 4,
      clinicId,
      availableBatches: [batch],
      performedById,
    });

    expect(updated).toBe(batch);
    expect(batch.quantity.value.toNumber()).toBe(14);
    expect(changedEvents(batch)[0].direction).toBe('IN');
    expect(changedEvents(item)).toHaveLength(0);
  });

  it('düşümde partiden düşer ve OUT olayını parti taşır', () => {
    const item = product();
    const batch = batchOf(item.id.value, 10);

    const updated = item.handleStockChange({
      quantityDelta: -4,
      clinicId,
      availableBatches: [batch],
      performedById,
    });

    expect(updated).toBe(batch);
    expect(batch.quantity.value.toNumber()).toBe(6);
    expect(changedEvents(batch)[0].direction).toBe('OUT');
  });

  it('açık batchId verilirse o parti hedeflenir', () => {
    const item = product();
    const first = batchOf(item.id.value, 10);
    const second = batchOf(item.id.value, 10);

    const updated = item.handleStockChange({
      quantityDelta: -2,
      clinicId,
      availableBatches: [first, second],
      explicitBatchId: second.id.value,
      performedById,
    });

    expect(updated).toBe(second);
    expect(second.quantity.value.toNumber()).toBe(8);
    expect(first.quantity.value.toNumber()).toBe(10);
  });

  it('parti yokken artış: null döner, olayı ürünün kendisi taşır (batchId null)', () => {
    const item = product();

    const updated = item.handleStockChange({
      quantityDelta: 7,
      clinicId,
      availableBatches: [],
      performedById,
    });

    expect(updated).toBeNull();

    const events = changedEvents(item);
    expect(events).toHaveLength(1);
    expect(events[0].batchId).toBeNull();
    expect(events[0].direction).toBe('IN');
    expect(events[0].quantity).toBe('7');
    expect(events[0].productId).toBe(item.id.value);
  });

  it('parti yokken düşüm reddedilir — olay üretilmez', () => {
    const item = product();

    expect(() =>
      item.handleStockChange({
        quantityDelta: -3,
        clinicId,
        availableBatches: [],
        performedById,
      })
    ).toThrow();

    expect(changedEvents(item)).toHaveLength(0);
  });

  it('başka kliniğin ürününde işlem reddedilir', () => {
    const item = product();

    expect(() =>
      item.handleStockChange({
        quantityDelta: 1,
        clinicId: randomUUID(),
        availableBatches: [],
        performedById,
      })
    ).toThrow();
  });
});

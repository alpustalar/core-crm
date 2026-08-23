import { randomUUID } from 'crypto';
import { StockQuantityChangedListener } from './stock-quantity-changed.listener';
import { StockQuantityChangedEvent } from '@modules/supply/inventory/domain/events';
import { StockMovement } from '@modules/supply/inventory/domain/entities/stock-movement.entity';

describe('StockQuantityChangedListener', () => {
  const movementId = randomUUID();
  const productId = randomUUID();
  const clinicId = randomUUID();
  const batchId = randomUUID();
  const performedById = randomUUID();

  const event = (): StockQuantityChangedEvent =>
    new StockQuantityChangedEvent({
      movementId,
      productId,
      clinicId,
      batchId,
      type: 'ADJUSTMENT',
      direction: 'OUT',
      quantity: '3.5',
      performedById,
      notes: 'Batch üzerinden stok düşümü yapıldı.',
    });

  function build(
    options: { existing?: boolean; failsOnCreate?: boolean } = {}
  ) {
    const findById = jest
      .fn()
      .mockResolvedValue(options.existing ? ({} as StockMovement) : null);

    const create = jest.fn((movement: StockMovement) =>
      options.failsOnCreate
        ? Promise.reject(new Error('db down'))
        : Promise.resolve(movement)
    );

    const repo = { findById, create, update: jest.fn() } as never;

    return {
      listener: new StockQuantityChangedListener(repo),
      findById,
      create,
    };
  }

  it('olayı stok hareketine çevirip yazar', async () => {
    const { listener, create } = build();

    await listener.handle(event());

    expect(create).toHaveBeenCalledTimes(1);

    const written = create.mock.calls[0][0];
    expect(written.id.value).toBe(movementId);
    expect(written.productId.value).toBe(productId);
    expect(written.batchId?.value).toBe(batchId);
    expect(written.direction).toBe('OUT');
    expect(written.type).toBe('ADJUSTMENT');
    expect(written.quantity.value.toNumber()).toBe(3.5);
    expect(written.performedById?.value).toBe(performedById);
  });

  it('aynı olay tekrar teslim edilirse hareket iki kez yazılmaz', async () => {
    const { listener, create } = build({ existing: true });

    await listener.handle(event());

    expect(create).not.toHaveBeenCalled();
  });

  it('yazma hatası yutulmaz — outbox kaydı yeniden denensin diye yukarı fırlatılır', async () => {
    const { listener } = build({ failsOnCreate: true });

    await expect(listener.handle(event())).rejects.toThrow('db down');
  });
});

import { EventEmitter2 } from '@nestjs/event-emitter';
import { MongoOutboxRelay } from './mongo-outbox.relay';

/**
 * Bu testler bir regresyonu kapatıyor: outbox'a yazan taraf vardı ama okuyan yoktu.
 * `outboxRun` event'i mühürlüyor, hiçbir `@OnEvent` dinleyicisi tetiklenmiyordu —
 * gelen mesaj kaydediliyor ama AI yanıtı hiç üretilmiyordu. Entegrasyon testi bunu
 * göremiyordu çünkü `MongoTransactionManager`'ı doğrudan emit eden bir sahteyle
 * değiştirip outbox→relay adımını atlıyordu.
 */

const MAX_ATTEMPTS = 5;

interface FakeRecord {
  _id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  processedAt: Date | null;
  attempts: number;
}

/**
 * Mongoose model'in davranışını taklit eden asgari sahte: `findOneAndUpdate`
 * atomik sahiplenmeyi (filtre + $set + $inc), `updateOne` sahiplenmeyi geri almayı
 * karşılar. Filtre semantiği gerçek sorguyla aynı tutuluyor.
 */
const createFakeModel = (records: FakeRecord[]) => ({
  records,
  findOneAndUpdate: jest.fn((filter: Record<string, any>) => ({
    exec: async () => {
      const maxAttempts = (filter.attempts as { $lt: number }).$lt;
      const skipped: string[] = filter._id?.$nin ?? [];
      const next = records
        .filter(
          (r) =>
            r.processedAt === null &&
            r.attempts < maxAttempts &&
            !skipped.includes(r._id)
        )
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];

      if (!next) return null;

      next.processedAt = new Date();
      next.attempts += 1;
      return next;
    },
  })),
  updateOne: jest.fn((filter: { _id: string }, update: Record<string, any>) => ({
    exec: async () => {
      const found = records.find((r) => r._id === filter._id);
      if (found) found.processedAt = update.$set.processedAt;
      return { acknowledged: true };
    },
  })),
});

const makeRecord = (overrides: Partial<FakeRecord> = {}): FakeRecord => ({
  _id: 'evt-1',
  type: 'messaging.message.received',
  payload: { conversationId: 'conv-1' },
  createdAt: new Date('2026-01-01T10:00:00Z'),
  processedAt: null,
  attempts: 0,
  ...overrides,
});

const createRelay = (records: FakeRecord[]) => {
  const model = createFakeModel(records);
  const emitter = { emitAsync: jest.fn().mockResolvedValue([]) };
  const relay = new MongoOutboxRelay(
    model as never,
    emitter as unknown as EventEmitter2
  );
  return { relay, model, emitter };
};

describe('MongoOutboxRelay', () => {
  it('işlenmemiş kaydı yayınlar — outboxRun sessizce yarım kalmaz', async () => {
    const records = [makeRecord()];
    const { relay, emitter } = createRelay(records);

    await relay.drain();

    expect(emitter.emitAsync).toHaveBeenCalledWith(
      'messaging.message.received',
      { conversationId: 'conv-1' }
    );
    expect(records[0].processedAt).not.toBeNull();
  });

  it('kayıtları eklenme sırasıyla boşaltır ve biterse durur', async () => {
    const records = [
      makeRecord({ _id: 'evt-2', createdAt: new Date('2026-01-01T11:00:00Z') }),
      makeRecord({ _id: 'evt-1', createdAt: new Date('2026-01-01T10:00:00Z') }),
    ];
    const { relay, emitter } = createRelay(records);

    await relay.drain();

    expect(emitter.emitAsync).toHaveBeenCalledTimes(2);
    expect(records.every((r) => r.processedAt !== null)).toBe(true);
  });

  it('yayınlama hata verirse sahiplenmeyi geri alır (sonraki tarama devralır)', async () => {
    const records = [makeRecord()];
    const { relay, emitter } = createRelay(records);
    emitter.emitAsync.mockRejectedValue(new Error('dinleyici patladı'));

    await relay.drain();

    // Geri alındı: sonraki periyodik taramada yeniden alınabilsin.
    expect(records[0].processedAt).toBeNull();
    // Deneme hakkı tek turda tükenmez — bir tur, bir deneme.
    expect(records[0].attempts).toBe(1);
  });

  it('başarısız kaydı aynı turda yeniden denemez (geçici arızada hak tükenmesin)', async () => {
    const records = [makeRecord()];
    const { relay, emitter } = createRelay(records);
    emitter.emitAsync.mockRejectedValue(new Error('geçici arıza'));

    await relay.drain();

    // Sıkı döngüde 5 hakkın tamamı milisaniyeler içinde harcanmamalı.
    expect(emitter.emitAsync).toHaveBeenCalledTimes(1);
  });

  it('bir kayıt patlasa da sıradakileri yayınlamayı sürdürür', async () => {
    const records = [
      makeRecord({ _id: 'evt-1', createdAt: new Date('2026-01-01T10:00:00Z') }),
      makeRecord({ _id: 'evt-2', createdAt: new Date('2026-01-01T11:00:00Z') }),
    ];
    const { relay, emitter } = createRelay(records);
    emitter.emitAsync.mockRejectedValueOnce(new Error('ilk kayıt patladı'));

    await relay.drain();

    expect(emitter.emitAsync).toHaveBeenCalledTimes(2);
    expect(records[0].processedAt).toBeNull(); // patlayan geri bırakıldı
    expect(records[1].processedAt).not.toBeNull(); // sıradaki yayınlandı
  });

  it('üst sınıra ulaşan kaydı artık almaz (poison pill döngüsü yok)', async () => {
    const records = [makeRecord({ attempts: MAX_ATTEMPTS })];
    const { relay, emitter } = createRelay(records);

    await relay.drain();

    expect(emitter.emitAsync).not.toHaveBeenCalled();
    // İşlenmemiş olarak görünür kalır — sessizce kaybolmaz.
    expect(records[0].processedAt).toBeNull();
  });

  it('aynı süreçte iki drain üst üste binmez', async () => {
    const records = [makeRecord()];
    const { relay, emitter } = createRelay(records);

    await Promise.all([relay.drain(), relay.drain()]);

    expect(emitter.emitAsync).toHaveBeenCalledTimes(1);
  });

  it('tarama hatası dışarı sızmaz (commit sonrası dürtme çağrıyı düşürmez)', async () => {
    const { relay, model } = createRelay([makeRecord()]);
    model.findOneAndUpdate.mockImplementationOnce(() => ({
      exec: async () => {
        throw new Error('mongo düştü');
      },
    }));

    await expect(relay.drain()).resolves.toBeUndefined();
  });
});

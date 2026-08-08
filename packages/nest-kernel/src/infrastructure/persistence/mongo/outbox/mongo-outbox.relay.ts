import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import { MESSAGING_MONGO_CONNECTION } from './../mongo.connection';
import { MongoOutbox, MongoOutboxDocument } from './mongo-outbox.schema';

/** Bir kaydı kaç kez denedikten sonra bırakırız (poison pill koruması). */
const MAX_ATTEMPTS = 5;

/** Güvenlik ağı taraması. Normal gecikmeyi `drain()`'i commit sonrası dürtmek karşılar. */
const POLL_INTERVAL_MS = 5_000;

/**
 * Mongo outbox relay'i — `outboxRun()` ile mühürlenen event'leri okuyup in-memory
 * yayınlar. Postgres tarafındaki `OutboxProcessor`'ın karşılığıdır.
 *
 * Olmadığında `outboxRun` sessizce yarım kalır: event kaydedilir ama hiçbir
 * `@OnEvent` dinleyicisi tetiklenmez. Gelen mesaj yolunda tam olarak bu olmuştu —
 * mesaj kaydediliyor, AI yanıtı hiç üretilmiyordu.
 *
 * **Çok örnekli çalışmaya uygun:** kayıt `findOneAndUpdate` ile atomik olarak
 * sahiplenilir (`processedAt` işaretlenir), böylece iki messaging örneği aynı
 * event'i iki kez yayınlamaz. Yayınlama hata verirse işaret geri alınır ve kayıt
 * sonraki turda yeniden denenir.
 */
@Injectable()
export class MongoOutboxRelay implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoOutboxRelay.name);
  private timer: NodeJS.Timeout | null = null;
  /** Aynı süreçte iki drain'in üst üste binmesini engeller. */
  private draining = false;

  constructor(
    @InjectModel(MongoOutbox.name, MESSAGING_MONGO_CONNECTION)
    private readonly outboxModel: Model<MongoOutboxDocument>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  onModuleInit(): void {
    // Periyodik tarama yalnız güvenlik ağıdır: commit ile dürtme arasında süreç
    // çökerse ya da başka bir örnek yazdıysa kayıt burada yakalanır.
    this.timer = setInterval(() => void this.drain(), POLL_INTERVAL_MS);
    this.timer.unref?.();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * İşlenmemiş kayıtları sırayla sahiplenip yayınlar. Commit sonrası doğrudan
   * çağrılır (gecikmeyi düşük tutmak için) ve periyodik olarak da çalışır.
   */
  async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;

    try {
      // Bu turda yayınlanamayanlar: hemen yeniden denenmezler. Aksi hâlde geçici
      // bir arızada deneme hakkı milisaniyeler içinde tükenirdi; oysa sınırın
      // amacı denemeleri zamana yaymak. Bir sonraki periyodik tarama devralır.
      const failed = new Set<string>();

      let record = await this.claimNext(failed);
      while (record) {
        const published = await this.publish(record);
        if (!published) failed.add(record._id);
        record = await this.claimNext(failed);
      }
    } catch (error) {
      this.logger.error('Outbox relay taraması başarısız', error);
    } finally {
      this.draining = false;
    }
  }

  /**
   * Sıradaki işlenmemiş kaydı atomik olarak sahiplenir. `processedAt`'i hemen
   * işaretlemek, aynı kaydın paralel bir örnek tarafından alınmasını engeller.
   */
  private claimNext(
    skipIds: Set<string>
  ): Promise<MongoOutboxDocument | null> {
    return this.outboxModel
      .findOneAndUpdate(
        {
          processedAt: null,
          attempts: { $lt: MAX_ATTEMPTS },
          ...(skipIds.size > 0 ? { _id: { $nin: [...skipIds] } } : {}),
        },
        { $set: { processedAt: new Date() }, $inc: { attempts: 1 } },
        { sort: { createdAt: 1 }, new: true }
      )
      .exec();
  }

  /** Yayınlandıysa `true`; hata olduysa sahiplenmeyi geri alıp `false`. */
  private async publish(record: MongoOutboxDocument): Promise<boolean> {
    try {
      await this.eventEmitter.emitAsync(record.type, record.payload);
      return true;
    } catch (error) {
      this.logger.error(
        `Outbox kaydı yayınlanamadı: id=${record._id} type=${record.type} deneme=${record.attempts}`,
        error
      );
      await this.release(record);
      return false;
    }
  }

  /**
   * Yayınlama başarısızsa sahiplenmeyi geri alır ki kayıt tekrar denensin.
   * `attempts` artmış kalır; üst sınıra ulaşınca kayıt artık alınmaz ve
   * işlenmemiş olarak görünür durur (sessizce kaybolmaz).
   */
  private async release(record: MongoOutboxDocument): Promise<void> {
    try {
      await this.outboxModel
        .updateOne({ _id: record._id }, { $set: { processedAt: null } })
        .exec();

      if (record.attempts >= MAX_ATTEMPTS) {
        this.logger.error(
          `Outbox kaydı ${MAX_ATTEMPTS} denemede yayınlanamadı, bırakılıyor: ` +
            `id=${record._id} type=${record.type}`
        );
      }
    } catch (error) {
      this.logger.error(
        `Outbox kaydının sahiplenmesi geri alınamadı: id=${record._id}`,
        error
      );
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from '@common/interfaces';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  TransactionContext,
  txStorage,
} from '@src/infrastructure/transaction/als-storage';
import { OutboxRepository } from '@src/infrastructure/persistence/prisma/outbox/outbox.repository';
import { CriticalFailurePublisher } from '@common/observability/critical-failure.publisher';

@Injectable()
export class TransactionManager {
  private readonly logger = new Logger(TransactionManager.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private outboxRepo: OutboxRepository,
    private readonly criticalFailure: CriticalFailurePublisher
  ) {}

  /**
   * İşi bir transaction içinde çalıştırır; biriken event'leri **commit'ten sonra**
   * in-memory yayınlar (kritik olmayan yan etkiler: audit log, bildirim).
   *
   * Emit'in transaction dışında olması üç şeyi garanti eder:
   * 1. Listener'lar yazılmış (commit edilmiş) veriyi görür — yarı yazılmış hâli değil.
   * 2. Transaction listener'lar çalışırken açık kalmaz; bağlantı havuzu bloke olmaz.
   * 3. Bir listener'ın hatası iş yazmasını geri sarmaz — `run()`'ın sözleşmesi zaten
   *    "atomik olması gerekmeyen event" olduğu için hata loglanır, akış sürer.
   *    Atomik garanti gerekiyorsa {@link outboxRun} kullanılır.
   */
  async run<T>(work: () => Promise<T>): Promise<T> {
    const existing = txStorage.getStore();
    if (existing?.tx) {
      // İç içe çağrı: event'ler dış store'a birikir, dıştaki run() yayınlar.
      return work();
    }

    const events: DomainEvent[] = [];

    const result = await this.prisma.$transaction(async (tx) => {
      const context: TransactionContext = {
        tx,
        events: [],
        correlationId: crypto.randomUUID(),
      };

      const value = await txStorage.run(context, work);
      events.push(...context.events);

      return value;
    });

    await this.emitAfterCommit(events);

    return result;
  }

  async outboxRun<T>(work: () => Promise<T>): Promise<T> {
    const existing = txStorage.getStore();
    if (existing?.tx) {
      return work();
    }

    return await this.prisma.$transaction(async (tx) => {
      const context: TransactionContext = {
        tx,
        events: [],
        correlationId: crypto.randomUUID(),
      };

      const result = await txStorage.run(context, work);

      if (context.events.length > 0) {
        await this.outboxRepo.saveEvents(context.events);
      }

      return result;
    });
  }

  /**
   * DB yazması olmayan, yalnız event yayınlayan akışlar için: ALS bağlamını kurar
   * ama **transaction açmaz**, iş bitince event'leri yayınlar.
   *
   * Neden var: `contextService.addEvent()` store yoksa event'i sessizce düşürür.
   * Bu yüzden "tx'e gerek yok" diye publisher'ı çıplak çağırmak event'i kaybettirir;
   * tek alternatif olarak boş bir transaction açmak da gereksiz maliyettir.
   *
   * ⚠️ Bu yol içinde DB **yazması yapılmaz** — yazma varsa {@link run} kullanılır
   * (burada `this.db` ana bağlantıya düşer, atomiklik ve satır kilidi yoktur).
   */
  async publish<T>(work: () => Promise<T>): Promise<T> {
    const existing = txStorage.getStore();
    if (existing) {
      // İç içe çağrı: event'ler dıştaki bağlama birikir, onu açan yayınlar.
      return work();
    }

    const context: TransactionContext = {
      events: [],
      correlationId: crypto.randomUUID(),
    };

    const result = await txStorage.run(context, work);

    await this.emitAfterCommit(context.events);

    return result;
  }

  /**
   * Toplanan event'leri yayınlar. Bir listener'ın hatası ne diğer listener'ları ne de
   * zaten kalıcılaşmış iş yazmasını etkiler; yalnız loglanır (kritik yan etkiler
   * outbox'tan gider). Sıra korunur: event'ler eklendikleri sırayla yayınlanır.
   */
  private async emitAfterCommit(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      try {
        await this.eventEmitter.emitAsync(event.name, event.payload);
      } catch (error) {
        this.logger.error(
          `Event listener'ı hata verdi (event=${event.name}): ${error}`
        );
        // Bu kanal kritik OLMAYAN yan etkiler için (kritik olanlar outbox'tan
        // gider); yine de sessizce düşen bir listener fark edilmeli — bildirim
        // gitmemiş ya da denetim kaydı yazılmamış olabilir. WARNING seviyesi,
        // dedupe event adına göre: aynı listener sürekli patlıyorsa tek satır.
        this.criticalFailure.publish({
          operation: 'events.in-memory-dispatch',
          severity: 'WARNING',
          summary: `Event dinleyicisi hata verdi: ${event.name}`,
          errorMessage: error instanceof Error ? error.message : String(error),
          context: { eventName: event.name },
          clinicId: null,
          dedupeKey: `listener-failed:${event.name}`,
        });
      }
    }
  }
}

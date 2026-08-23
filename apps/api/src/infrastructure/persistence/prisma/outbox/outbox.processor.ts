import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bullmq';
import { QUEUES } from '@common/constants';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { CriticalFailurePublisher } from '@common/observability/critical-failure.publisher';

@Processor(QUEUES.OUTBOX)
export class OutboxProcessor extends WorkerHost {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly criticalFailure: CriticalFailurePublisher
  ) {
    super();
  }

  async process(_job: Job): Promise<void> {
    const records = await this.prisma.outbox.findMany({
      where: { processedAt: null },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    if (records.length === 0) return;

    this.logger.log(`Processing ${records.length} outbox records`);

    for (const record of records) {
      try {
        await this.eventEmitter.emitAsync(record.type, record.payload);
        await this.prisma.outbox.update({
          where: { id: record.id },
          data: { processedAt: DateTimeManager.create() },
        });
      } catch (error) {
        this.logger.error(
          `Outbox record failed: id=${record.id} type=${record.type}`,
          error
        );
        // Outbox'ın tüm varlık sebebi kritik event'in teslim edilmesini garanti
        // etmek. `processedAt` boş kaldığı için kayıt her turda yeniden denenir —
        // kaybolmaz ama kalıcı bir hatada sonsuza kadar takılı kalır ve kimse
        // görmez. `dedupeKey` kayıt bazlı: her tur yeni uyarı üretmesin.
        this.criticalFailure.publish({
          operation: 'outbox.deliver',
          severity: 'CRITICAL',
          summary: 'Outbox kaydı teslim edilemedi; her turda yeniden deneniyor.',
          errorMessage: error instanceof Error ? error.message : String(error),
          context: { outboxId: record.id, eventType: record.type },
          clinicId: null,
          dedupeKey: `outbox-delivery-failed:${record.id}`,
        });
      }
    }
  }
}

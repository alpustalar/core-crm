import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bullmq';
import { QUEUES } from '@common/constants';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

@Processor(QUEUES.OUTBOX)
export class OutboxProcessor extends WorkerHost {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
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
      }
    }
  }
}

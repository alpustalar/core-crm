import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { EDocumentProducer } from './producers/e-document.producer';
import { EDocumentProcessor } from './processors/e-document.processor';
import { NoopEInvoiceModule } from '../adapters/noop/noop-e-invoice.module';

/**
 * e-Belge kuyruk altyapısı: producer (enqueue) + processor (worker) + aktif adapter.
 * Cross-module query/command'ler global TSCommandBus/TSQueryBus üzerinden çözülür.
 */
@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.E_DOCUMENT }),
    NoopEInvoiceModule,
  ],
  providers: [EDocumentProducer, EDocumentProcessor],
  exports: [EDocumentProducer],
})
export class EDocumentQueueModule {}

import { Module } from '@nestjs/common';
import { EDocumentCommandModule } from './application/commands/command.module';
import { EDocumentQueueModule } from './infrastructure/queue/e-document-queue.module';

/**
 * Entegratör (e-Belge) modülü (doc 07). Çekirdek yalnız EInvoicePort'u tanır;
 * entegratör kapalıyken NoopEInvoiceAdapter devrede (belge INTERNAL). Route yok —
 * tetikleme QueueEDocumentCommand ile, işleme BullMQ processor ile yapılır.
 */
@Module({
  imports: [EDocumentCommandModule, EDocumentQueueModule],
  exports: [EDocumentCommandModule],
})
export class EDocumentModule {}

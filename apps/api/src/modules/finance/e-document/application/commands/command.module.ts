import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { QueueEDocumentHandler } from './queue-e-document/queue-e-document.handler';
import { EDocumentQueueModule } from '../../infrastructure/queue/e-document-queue.module';

export const E_DOCUMENT_COMMAND_HANDLERS = [QueueEDocumentHandler];

@Module({
  imports: [CqrsModule, EDocumentQueueModule],
  providers: E_DOCUMENT_COMMAND_HANDLERS,
  exports: E_DOCUMENT_COMMAND_HANDLERS,
})
export class EDocumentCommandModule {}

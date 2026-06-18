import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { E_DOCUMENT_JOBS, QUEUES } from '@common/constants';

/**
 * e-Belge gönderimini kuyruğa alan producer (doc 07 §5). e-belge "outbound" olduğu
 * için fişi bloklamaz; gönderim async kuyruğa düşer. jobId=invoiceId → idempotent
 * (aynı fatura iki kez enqueue edilse tek job). Başarısız job dead-letter olarak kalır.
 */
@Injectable()
export class EDocumentProducer {
  constructor(
    @InjectQueue(QUEUES.E_DOCUMENT) private readonly eDocumentQueue: Queue
  ) {}

  async enqueueSend(invoiceId: string): Promise<void> {
    await this.eDocumentQueue.add(
      E_DOCUMENT_JOBS.SEND,
      { invoiceId },
      {
        jobId: `e-document:${invoiceId}`,
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  }
}

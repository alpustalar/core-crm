import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  MESSAGING_JOBS,
  MESSAGING_SEND_MAX_ATTEMPTS,
  QUEUES,
} from '@common/constants';

/**
 * Giden mesajı kanala gönderim için kuyruğa alan producer. Mesaj zaten QUEUED olarak
 * persist edilmiştir; gönderim async kuyruğa düşer (HTTP latency'si kullanıcıyı
 * bloklamaz, rate-limit/retry kuyrukta yönetilir). jobId=messageId → idempotent.
 */
@Injectable()
export class SendMessageProducer {
  constructor(
    @InjectQueue(QUEUES.MESSAGING) private readonly queue: Queue
  ) {}

  async enqueueSend(messageId: string): Promise<void> {
    await this.queue.add(
      MESSAGING_JOBS.SEND_MESSAGE,
      { messageId },
      {
        jobId: `messaging:send:${messageId}`,
        attempts: MESSAGING_SEND_MAX_ATTEMPTS,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  }
}

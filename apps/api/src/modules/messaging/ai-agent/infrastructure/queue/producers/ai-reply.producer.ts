import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  MESSAGING_AI_JOBS,
  MESSAGING_AI_MAX_ATTEMPTS,
  QUEUES,
} from '@common/constants';
import { MessagingJobIds } from '@modules/messaging/ai-agent/domain/constants/messaging.constants';

export interface AiReplyJobData {
  conversationId: string;
  messageId: string;
}

/**
 * Gelen mesaj için AI yanıt üretimini kuyruğa alan producer. jobId=ai:reply:{messageId}
 * → aynı mesaj için mükerrer yanıt üretilmez (idempotent). Anthropic latency'si webhook'u
 * bloklamaz; rate-limit/retry kuyrukta yönetilir.
 */
@Injectable()
export class AiReplyProducer {
  constructor(
    @InjectQueue(QUEUES.MESSAGING_AI) private readonly queue: Queue
  ) {}

  async enqueueReply(data: AiReplyJobData): Promise<void> {
    await this.queue.add(MESSAGING_AI_JOBS.GENERATE_REPLY, data, {
      jobId: MessagingJobIds.AI_REPLY(data.messageId),
      attempts: MESSAGING_AI_MAX_ATTEMPTS,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}

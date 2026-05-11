import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES, USER_JOBS } from '@common/constants';

@Injectable()
export class UserProducer {
  constructor(@InjectQueue(QUEUES.USER) private readonly userQueue: Queue) {}

  async compensateFirebaseRollback(payload: { firebaseUid: string }) {
    await this.userQueue.add(USER_JOBS.FIREBASE_ROLLBACK, payload, {
      attempts: 10,
      backoff: {
        type: 'exponential',
        delay: 10000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}

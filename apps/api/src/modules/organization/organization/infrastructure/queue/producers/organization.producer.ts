import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ORGANIZATION_JOBS, QUEUES } from '@common/constants';

@Injectable()
export class OrganizationProducer {
  constructor(
    @InjectQueue(QUEUES.ORGANIZATION) private readonly organizationQueue: Queue
  ) {}

  async addOrganizationDeletionJob(data) {
    await this.organizationQueue.add(ORGANIZATION_JOBS.CLEAN_UP, data, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
    });
  }
}

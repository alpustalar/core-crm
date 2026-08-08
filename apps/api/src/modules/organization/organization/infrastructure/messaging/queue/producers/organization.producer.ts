import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ORGANIZATION_JOBS, QUEUES } from '@common/constants';
import { IOrganizationProducer } from '@modules/organization/organization/domain/interfaces/organization.producer.interface';

@Injectable()
export class OrganizationProducer implements IOrganizationProducer {
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

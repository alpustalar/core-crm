import { Module } from '@nestjs/common';
import { ORGANIZATION_PRODUCER } from '@modules/organization/organization/domain/interfaces/organization.producer.interface';
import { OrganizationProducer } from '@modules/organization/organization/infrastructure/messaging/queue/producers/organization.producer';

@Module({
  providers: [
    { provide: ORGANIZATION_PRODUCER, useClass: OrganizationProducer },
  ],
  exports: [ORGANIZATION_PRODUCER],
})
export class OrganizationQueueModule {}

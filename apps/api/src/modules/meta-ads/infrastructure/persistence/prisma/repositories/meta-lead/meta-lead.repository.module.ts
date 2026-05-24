import { Module } from '@nestjs/common';
import {
  META_LEAD_COMMAND_REPOSITORY,
  META_LEAD_QUERY_REPOSITORY,
} from '@modules/meta-ads/domain/repositories/meta-lead.repository.interface';
import { MetaLeadCommandRepository } from './meta-lead.command.repository';
import { MetaLeadQueryRepository } from './meta-lead.query.repository';

@Module({
  providers: [
    { provide: META_LEAD_COMMAND_REPOSITORY, useClass: MetaLeadCommandRepository },
    { provide: META_LEAD_QUERY_REPOSITORY, useClass: MetaLeadQueryRepository },
  ],
  exports: [META_LEAD_COMMAND_REPOSITORY, META_LEAD_QUERY_REPOSITORY],
})
export class MetaLeadRepositoryModule {}

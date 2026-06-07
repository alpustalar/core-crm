import { Module } from '@nestjs/common';
import {
  ORGANIZATION_COMMAND_REPOSITORY,
  ORGANIZATION_QUERY_REPOSITORY,
} from '@modules/organization/organization/domain/repositories/organization.repository.interface';
import { OrganizationCommandRepository } from './organization.command.repository';
import { OrganizationQueryRepository } from './organization.query.repository';

@Module({
  providers: [
    {
      provide: ORGANIZATION_COMMAND_REPOSITORY,
      useClass: OrganizationCommandRepository,
    },
    {
      provide: ORGANIZATION_QUERY_REPOSITORY,
      useClass: OrganizationQueryRepository,
    },
  ],
  exports: [ORGANIZATION_COMMAND_REPOSITORY, ORGANIZATION_QUERY_REPOSITORY],
})
export class OrganizationRepositoryModule {}

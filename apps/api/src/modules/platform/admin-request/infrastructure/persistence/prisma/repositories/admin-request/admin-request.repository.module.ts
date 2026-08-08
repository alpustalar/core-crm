import { Module } from '@nestjs/common';
import { AdminRequestCommandRepository } from './admin-request.command.repository';
import { AdminRequestQueryRepository } from './admin-request.query.repository';
import { ADMIN_REQUEST_COMMAND_REPOSITORY } from '@modules/platform/admin-request/domain/repositories/admin-request/admin-request.command.repository';
import { ADMIN_REQUEST_QUERY_REPOSITORY } from '@modules/platform/admin-request/domain/repositories/admin-request/admin-request.query.repository';

@Module({
  providers: [
    {
      provide: ADMIN_REQUEST_COMMAND_REPOSITORY,
      useClass: AdminRequestCommandRepository,
    },
    {
      provide: ADMIN_REQUEST_QUERY_REPOSITORY,
      useClass: AdminRequestQueryRepository,
    },
  ],
  exports: [ADMIN_REQUEST_COMMAND_REPOSITORY, ADMIN_REQUEST_QUERY_REPOSITORY],
})
export class AdminRequestRepositoryModule {}

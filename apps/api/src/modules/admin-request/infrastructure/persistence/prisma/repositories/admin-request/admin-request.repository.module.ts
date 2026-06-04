import { Module } from '@nestjs/common';
import {
  ADMIN_REQUEST_COMMAND_REPOSITORY,
  ADMIN_REQUEST_QUERY_REPOSITORY,
} from '@modules/admin-request/domain/repositories/admin-request.repository.interface';
import { AdminRequestCommandRepository } from './admin-request.command.repository';
import { AdminRequestQueryRepository } from './admin-request.query.repository';

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

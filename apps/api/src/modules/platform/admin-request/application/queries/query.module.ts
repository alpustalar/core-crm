import { Module } from '@nestjs/common';
import { FindAdminRequestsHandler } from './find-admin-requests/find-admin-requests.handler';
import { AdminRequestRepositoryModule } from '@modules/platform/admin-request/infrastructure/persistence/prisma/repositories/admin-request/admin-request.repository.module';

export const ADMIN_REQUEST_QUERY_HANDLERS = [FindAdminRequestsHandler];

@Module({
  imports: [AdminRequestRepositoryModule],
  providers: ADMIN_REQUEST_QUERY_HANDLERS,
  exports: ADMIN_REQUEST_QUERY_HANDLERS,
})
export class AdminRequestQueryModule {}

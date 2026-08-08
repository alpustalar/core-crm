import { Module } from '@nestjs/common';
import { FindAdminRequestsHandler } from './find-admin-requests/find-admin-requests.handler';
import { AdminRequestRepositoriesModule } from '@modules/platform/admin-request/infrastructure/persistence/prisma/repositories/repositories.module';

export const ADMIN_REQUEST_QUERY_HANDLERS = [FindAdminRequestsHandler];

@Module({
  imports: [AdminRequestRepositoriesModule],
  providers: ADMIN_REQUEST_QUERY_HANDLERS,
})
export class AdminRequestQueryModule {}

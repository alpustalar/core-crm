import { Module } from '@nestjs/common';
import { CreateAdminRequestHandler } from './create-admin-request/create-admin-request.handler';
import { ReviewAdminRequestHandler } from './review-admin-request/review-admin-request.handler';
import { AdminRequestRepositoryModule } from '@modules/admin-request/infrastructure/persistence/prisma/repositories/admin-request/admin-request.repository.module';
import { AdminRequestEventModule } from '@modules/admin-request/infrastructure/events/admin-request-event.module';

export const ADMIN_REQUEST_COMMAND_HANDLERS = [
  CreateAdminRequestHandler,
  ReviewAdminRequestHandler,
];

@Module({
  imports: [AdminRequestRepositoryModule, AdminRequestEventModule],
  providers: ADMIN_REQUEST_COMMAND_HANDLERS,
  exports: ADMIN_REQUEST_COMMAND_HANDLERS,
})
export class AdminRequestCommandModule {}

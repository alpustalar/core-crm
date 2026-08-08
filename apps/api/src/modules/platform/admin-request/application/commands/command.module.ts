import { Module } from '@nestjs/common';
import { CreateAdminRequestHandler } from './create-admin-request/create-admin-request.handler';
import { ReviewAdminRequestHandler } from './review-admin-request/review-admin-request.handler';
import { AdminRequestInfrastructureModule } from '@modules/platform/admin-request/infrastructure/infrastructure.module';

export const ADMIN_REQUEST_COMMAND_HANDLERS = [
  CreateAdminRequestHandler,
  ReviewAdminRequestHandler,
];

@Module({
  imports: [AdminRequestInfrastructureModule],
  providers: ADMIN_REQUEST_COMMAND_HANDLERS,
})
export class AdminRequestCommandModule {}

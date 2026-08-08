import { Module } from '@nestjs/common';
import { AdminRequestController } from '@modules/platform/admin-request/presentation/http/controllers/admin-request.controller';
import { AdminRequestCommandModule } from '@modules/platform/admin-request/application/commands/command.module';
import { AdminRequestQueryModule } from '@modules/platform/admin-request/application/queries/query.module';

@Module({
  imports: [AdminRequestCommandModule, AdminRequestQueryModule],
  controllers: [AdminRequestController],
})
export class AdminRequestPresentationModule {}

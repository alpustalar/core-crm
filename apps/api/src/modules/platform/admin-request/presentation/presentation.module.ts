import { Module } from '@nestjs/common';
import { AdminRequestQueryController } from '@modules/platform/admin-request/presentation/http/controllers/admin-request.query.controller';
import { AdminRequestCommandController } from '@modules/platform/admin-request/presentation/http/controllers/admin-request.command.controller';
import { AdminRequestCommandModule } from '@modules/platform/admin-request/application/commands/command.module';
import { AdminRequestQueryModule } from '@modules/platform/admin-request/application/queries/query.module';

@Module({
  imports: [AdminRequestCommandModule, AdminRequestQueryModule],
  controllers: [AdminRequestQueryController, AdminRequestCommandController],
})
export class AdminRequestPresentationModule {}

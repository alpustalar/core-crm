import { Module } from '@nestjs/common';
import { AdminRequestController } from './controllers/admin-request.controller';
import { AdminRequestCommandModule } from '@modules/admin-request/application/commands/command.module';
import { AdminRequestQueryModule } from '@modules/admin-request/application/queries/query.module';

@Module({
  imports: [AdminRequestCommandModule, AdminRequestQueryModule],
  controllers: [AdminRequestController],
})
export class AdminRequestPresentationModule {}

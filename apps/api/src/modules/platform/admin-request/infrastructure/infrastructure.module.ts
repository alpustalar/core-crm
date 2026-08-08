import { Module } from '@nestjs/common';
import { AdminRequestRepositoriesModule } from '@modules/platform/admin-request/infrastructure/persistence/prisma/repositories/repositories.module';
import { AdminRequestEventModule } from '@modules/platform/admin-request/infrastructure/messaging/events/admin-request-event.module';

const AdminRequestInfrastructureModules = [
  AdminRequestRepositoriesModule,
  AdminRequestEventModule,
];

@Module({
  imports: [...AdminRequestInfrastructureModules],
  exports: [...AdminRequestInfrastructureModules],
})
export class AdminRequestInfrastructureModule {}

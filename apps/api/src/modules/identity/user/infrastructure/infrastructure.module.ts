import { Module } from '@nestjs/common';
import { UserRepositoriesModule } from '@modules/identity/user/infrastructure/persistence/prisma/repositories/repositories.module';
import { UserEventModule } from '@modules/identity/user/infrastructure/messaging/events/user-event.module';

const UserInfrastructureModules = [UserRepositoriesModule, UserEventModule];

@Module({
  imports: [...UserInfrastructureModules],
  exports: [...UserInfrastructureModules],
})
export class UserInfrastructureModule {}

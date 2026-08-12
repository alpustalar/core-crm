import { Module } from '@nestjs/common';
import { UserRepositoryModule } from '@modules/identity/user/infrastructure/persistence/prisma/repositories/user/user.repository.module';
import { UserCapabilityRepositoryModule } from '@modules/identity/user/infrastructure/persistence/prisma/repositories/user-capability/user-capability.repository.module';

const UserRepositoriesModules = [
  UserRepositoryModule,
  UserCapabilityRepositoryModule,
];

@Module({
  imports: [...UserRepositoriesModules],
  exports: [...UserRepositoriesModules],
})
export class UserRepositoriesModule {}

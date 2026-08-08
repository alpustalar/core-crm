import { Module } from '@nestjs/common';
import { UserRepositoryModule } from '@modules/identity/user/infrastructure/persistence/prisma/repositories/user/user.repository.module';

const UserRepositoriesModules = [UserRepositoryModule];

@Module({
  imports: [...UserRepositoriesModules],
  exports: [...UserRepositoriesModules],
})
export class UserRepositoriesModule {}

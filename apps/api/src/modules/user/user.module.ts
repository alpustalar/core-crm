import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { UserUseCaseModule } from '@modules/user/application/use-cases/module';
import { UserRepository } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';
import { UserControllers } from '@modules/user/presentation/controllers';
import { UserModuleApi } from '@modules/user/user-module.api';

@Module({
  imports: [FirebaseModule, PrismaModule, UserUseCaseModule],
  controllers: [...UserControllers],
  providers: [UserRepository, UserUseCaseModule, UserModuleApi],
  exports: [UserModuleApi],
})
export class UserModule {}

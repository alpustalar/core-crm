import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { UserUseCaseModule } from '@modules/user/use-cases/module';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { UserControllers } from '@modules/user/controllers';

@Module({
  imports: [FirebaseModule, PrismaModule, UserUseCaseModule],
  controllers: [...UserControllers],
  providers: [UserRepository],
})
export class UserModule {}

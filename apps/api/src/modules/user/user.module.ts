import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { UserModuleApi } from '@modules/user/user.module.api';
import { UserPresentationModule } from '@modules/user/presentation/user-presentation.module';
import { UserTransformInterceptor } from '@modules/user/presentation/user-transform.interceptor';
import { UserEventModule } from '@modules/user/infrastructure/events/user-event.module';
import { UserCommandModule } from '@modules/user/application/commands/command.module';
import { UserQueryModule } from '@modules/user/application/queries/query.module';
import { USER_MODULE_API_TOKEN } from '@modules/user/domain/interfaces/user.module.api.interface';

@Module({
  imports: [
    FirebaseModule,
    PrismaModule,
    UserCommandModule,
    UserQueryModule,
    UserPresentationModule,
    UserEventModule,
  ],
  providers: [
    { provide: USER_MODULE_API_TOKEN, useClass: UserModuleApi },
    UserTransformInterceptor,
  ],
  exports: [USER_MODULE_API_TOKEN],
})
export class UserModule {}

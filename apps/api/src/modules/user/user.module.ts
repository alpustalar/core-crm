import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { UserPresentationModule } from '@modules/user/presentation/user-presentation.module';
import { UserTransformInterceptor } from '@modules/user/presentation/user-transform.interceptor';
import { UserEventModule } from '@modules/user/infrastructure/events/user-event.module';
import { UserCommandModule } from '@modules/user/application/commands/command.module';
import { UserQueryModule } from '@modules/user/application/queries/query.module';

@Module({
  imports: [
    FirebaseModule,
    PrismaModule,
    UserCommandModule,
    UserQueryModule,
    UserPresentationModule,
    UserEventModule,
  ],
  providers: [UserTransformInterceptor],
})
export class UserModule {}

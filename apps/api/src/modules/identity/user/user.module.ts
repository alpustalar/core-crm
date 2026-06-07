import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { FirebaseModule } from '@modules/identity/auth/firebase/firebase.module';
import { UserPresentationModule } from '@modules/identity/user/presentation/user-presentation.module';
import { UserTransformInterceptor } from '@modules/identity/user/presentation/user-transform.interceptor';
import { UserEventModule } from '@modules/identity/user/infrastructure/events/user-event.module';
import { UserCommandModule } from '@modules/identity/user/application/commands/command.module';
import { UserQueryModule } from '@modules/identity/user/application/queries/query.module';

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

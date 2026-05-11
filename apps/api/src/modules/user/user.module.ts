import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { UserModuleApi } from '@modules/user/user.module.api';
import { UserPresentationModule } from '@modules/user/presentation/user-presentation.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { UserProcessor } from '@modules/user/infrastructure/queue/processors/user.processor';
import { UserProducer } from '@modules/user/infrastructure/queue/producer/user.producer';
import { UserTransformInterceptor } from '@modules/user/presentation/user-transform.interceptor';
import { UserEventsModule } from '@modules/user/infrastructure/events/user-events.module';
import { UserCommandModule } from '@modules/user/application/commands/command.module';
import { UserQueryModule } from '@modules/user/application/queries/query.module';

@Module({
  imports: [
    FirebaseModule,
    PrismaModule,
    UserCommandModule,
    UserQueryModule,
    UserPresentationModule,
    BullModule.registerQueue({ name: QUEUES.USER }),
    UserEventsModule,
  ],
  providers: [
    UserModuleApi,
    UserProcessor,
    UserProducer,
    UserTransformInterceptor,
  ],
  exports: [UserModuleApi],
})
export class UserModule {}

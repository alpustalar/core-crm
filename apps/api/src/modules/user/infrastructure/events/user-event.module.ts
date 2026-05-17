import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs'; // Şart!
import { CreateUserListener } from '@modules/user/infrastructure/events/listeners/create-user.listener';
import { EnqueueForceDeleteListener } from '@modules/user/infrastructure/events/listeners/enqueue-force-delete.listener';
import { SendUserPasswordResetLinkByActorListener } from '@modules/user/infrastructure/events/listeners/send-user-password-reset-link-by-actor.listener';
import { UpdateUserByStaffListener } from '@modules/user/infrastructure/events/listeners/update-user-by-staff.listener';
import { USER_EVENT_PUBLISHER_TOKEN } from '@modules/user/domain/interfaces/user-event-publisher.interface';
import { UserEventPublisher } from '@modules/user/infrastructure/events/user-event-publisher.service';
import { UserProducer } from '@modules/user/infrastructure/queue/producer/user.producer';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';

@Module({
  imports: [CqrsModule, BullModule.registerQueue({ name: QUEUES.USER })],
  providers: [
    CreateUserListener,
    EnqueueForceDeleteListener,
    SendUserPasswordResetLinkByActorListener,
    UpdateUserByStaffListener,
    UserProducer,

    {
      provide: USER_EVENT_PUBLISHER_TOKEN,
      useClass: UserEventPublisher,
    },
  ],
  exports: [USER_EVENT_PUBLISHER_TOKEN],
})
export class UserEventModule {}

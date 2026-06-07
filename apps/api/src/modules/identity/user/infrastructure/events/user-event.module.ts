import { Module } from '@nestjs/common';
import { CreateUserListener } from '@modules/identity/user/infrastructure/events/listeners/create-user.listener';
import { EnqueueForceDeleteListener } from '@modules/identity/user/infrastructure/events/listeners/enqueue-force-delete.listener';
import { SendUserPasswordResetLinkByActorListener } from '@modules/identity/user/infrastructure/events/listeners/send-user-password-reset-link-by-actor.listener';
import { UpdateUserByStaffListener } from '@modules/identity/user/infrastructure/events/listeners/update-user-by-staff.listener';
import { USER_EVENT_PUBLISHER } from '@modules/identity/user/domain/interfaces/user-event-publisher.interface';
import { UserEventPublisher } from '@modules/identity/user/infrastructure/events/user-event-publisher.service';
import { UserProducer } from '@modules/identity/user/infrastructure/queue/producer/user.producer';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.USER })],
  providers: [
    CreateUserListener,
    EnqueueForceDeleteListener,
    SendUserPasswordResetLinkByActorListener,
    UpdateUserByStaffListener,
    UserProducer,
    {
      provide: USER_EVENT_PUBLISHER,
      useClass: UserEventPublisher,
    },
  ],
  exports: [USER_EVENT_PUBLISHER],
})
export class UserEventModule {}

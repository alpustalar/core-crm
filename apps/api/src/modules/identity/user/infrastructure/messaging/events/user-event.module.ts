import { Module } from '@nestjs/common';
import { CreateUserListener } from '@modules/identity/user/infrastructure/messaging/events/listeners/create-user.listener';
import { EnqueueForceDeleteListener } from '@modules/identity/user/infrastructure/messaging/events/listeners/enqueue-force-delete.listener';
import { SendUserPasswordResetLinkByActorListener } from '@modules/identity/user/infrastructure/messaging/events/listeners/send-user-password-reset-link-by-actor.listener';
import { UpdateUserByStaffListener } from '@modules/identity/user/infrastructure/messaging/events/listeners/update-user-by-staff.listener';
import { UserScopeChangedListener } from '@modules/identity/user/infrastructure/messaging/events/listeners/user-scope-changed.listener';
import { USER_EVENT_PUBLISHER } from '@modules/identity/user/domain/interfaces/user-event-publisher.interface';
import { UserEventPublisher } from '@modules/identity/user/infrastructure/messaging/events/user-event-publisher.service';
import { UserProducer } from '@modules/identity/user/infrastructure/messaging/queue/producer/user.producer';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.USER })],
  providers: [
    CreateUserListener,
    EnqueueForceDeleteListener,
    SendUserPasswordResetLinkByActorListener,
    UpdateUserByStaffListener,
    UserScopeChangedListener,
    UserProducer,
    {
      provide: USER_EVENT_PUBLISHER,
      useClass: UserEventPublisher,
    },
  ],
  exports: [USER_EVENT_PUBLISHER],
})
export class UserEventModule {}

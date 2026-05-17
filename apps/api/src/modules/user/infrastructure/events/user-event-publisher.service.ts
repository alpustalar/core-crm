import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { IUserEventPublisher } from '@modules/user/domain/interfaces/user-event-publisher.interface';
import {
  CreateUserEvent,
  CreateUserEventPayload,
} from '@modules/user/domain/events/create-user.event';
import {
  UpdateUserByStaffEvent,
  UpdateUserByStaffEventPayload,
} from '@modules/user/domain/events/update-user-by-staff.event';
import {
  EnqueueForceDeleteEvent,
  EnqueueForceDeleteEventPayload,
} from '@modules/user/domain/events/enqueue-force-delete.event';
import {
  SendUserPasswordResetLinkByActorEvent,
  SendUserPasswordResetLinkByActorEventPayload,
} from '@modules/user/domain/events/send-user-password-reset-link-by-actor.event';

@Injectable()
export class UserEventPublisher implements IUserEventPublisher {
  constructor(private readonly eventBus: EventBus) {}

  create(payload: CreateUserEventPayload) {
    this.eventBus.publish(new CreateUserEvent(payload));
  }

  sendUserPasswordResetLinkByActor(
    payload: SendUserPasswordResetLinkByActorEventPayload
  ) {
    this.eventBus.publish(new SendUserPasswordResetLinkByActorEvent(payload));
  }

  updateUserByStaff(payload: UpdateUserByStaffEventPayload) {
    this.eventBus.publish(new UpdateUserByStaffEvent(payload));
  }

  enqueueForceDelete(payload: EnqueueForceDeleteEventPayload) {
    this.eventBus.publish(new EnqueueForceDeleteEvent(payload));
  }
}

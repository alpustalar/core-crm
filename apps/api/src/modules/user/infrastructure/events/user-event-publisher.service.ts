import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { IUserEventPublisher } from '@modules/user/domain/interfaces/user-event-publisher.interface';
import {
  CreateUserEvent,
  ICreateUserEventParams,
} from '@modules/user/domain/events/create-user.event';
import {
  IUpdateUserByStaffEventParams,
  UpdateUserByStaffEvent,
} from '@modules/user/domain/events/update-user-by-staff.event';
import {
  EnqueueForceDeleteEvent,
  IEnqueueForceDeleteEventParams,
} from '@modules/user/domain/events/enqueue-force-delete.event';
import {
  SendUserPasswordResetLinkByActorEvent,
  SendUserPasswordResetLinkByActorEventParams,
} from '@modules/user/domain/events/send-user-password-reset-link-by-actor.event';

@Injectable()
export class UserEventPublisher implements IUserEventPublisher {
  constructor(private readonly eventBus: EventBus) {}

  create(event: ICreateUserEventParams) {
    this.eventBus.publish(new CreateUserEvent(event));
  }

  sendUserPasswordResetLinkByActor(
    event: SendUserPasswordResetLinkByActorEventParams
  ) {
    this.eventBus.publish(new SendUserPasswordResetLinkByActorEvent(event));
  }

  updateUserByStaff(event: IUpdateUserByStaffEventParams) {
    this.eventBus.publish(new UpdateUserByStaffEvent(event));
  }

  enqueueForceDelete(event: IEnqueueForceDeleteEventParams) {
    this.eventBus.publish(new EnqueueForceDeleteEvent(event));
  }
}

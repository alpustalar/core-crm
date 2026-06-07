import { Inject, Injectable } from '@nestjs/common';
import { IUserEventPublisher } from '@modules/identity/user/domain/interfaces/user-event-publisher.interface';
import {
  CreateUserEvent,
  CreateUserEventPayload,
} from '@modules/identity/user/domain/events/create-user.event';
import {
  UpdateUserByStaffEvent,
  UpdateUserByStaffEventPayload,
} from '@modules/identity/user/domain/events/update-user-by-staff.event';
import {
  EnqueueForceDeleteEvent,
  EnqueueForceDeleteEventPayload,
} from '@modules/identity/user/domain/events/enqueue-force-delete.event';
import {
  SendUserPasswordResetLinkByActorEvent,
  SendUserPasswordResetLinkByActorEventPayload,
} from '@modules/identity/user/domain/events/send-user-password-reset-link-by-actor.event';
import {
  CONTEXT_SERVICE,
  IContextService,
} from '@src/infrastructure/context/domain/interfaces/context.service.interface';

@Injectable()
export class UserEventPublisher implements IUserEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService
  ) {}

  create(payload: CreateUserEventPayload) {
    this.contextService.addEvent(new CreateUserEvent(payload));
  }

  sendUserPasswordResetLinkByActor(
    payload: SendUserPasswordResetLinkByActorEventPayload
  ) {
    this.contextService.addEvent(
      new SendUserPasswordResetLinkByActorEvent(payload)
    );
  }

  updateUserByStaff(payload: UpdateUserByStaffEventPayload) {
    this.contextService.addEvent(new UpdateUserByStaffEvent(payload));
  }

  enqueueForceDelete(payload: EnqueueForceDeleteEventPayload) {
    this.contextService.addEvent(new EnqueueForceDeleteEvent(payload));
  }
}

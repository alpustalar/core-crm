import { Inject, Injectable } from '@nestjs/common';
import { IUserEventPublisher } from '@modules/identity/user/domain/interfaces/user-event-publisher.interface';
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
} from '@src/infrastructure/context/context.service.interface';

@Injectable()
export class UserEventPublisher implements IUserEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService
  ) {}

  sendUserPasswordResetLinkByActor(
    payload: SendUserPasswordResetLinkByActorEventPayload
  ) {
    this.contextService.addEvent(
      new SendUserPasswordResetLinkByActorEvent(payload)
    );
  }

  enqueueForceDelete(payload: EnqueueForceDeleteEventPayload) {
    this.contextService.addEvent(new EnqueueForceDeleteEvent(payload));
  }
}

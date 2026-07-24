import { EnqueueForceDeleteEventPayload } from '@modules/identity/user/domain/events/enqueue-force-delete.event';
import { SendUserPasswordResetLinkByActorEventPayload } from '@modules/identity/user/domain/events/send-user-password-reset-link-by-actor.event';

export const USER_EVENT_PUBLISHER = 'IUserEventPublisher';

export interface IUserEventPublisher {
  sendUserPasswordResetLinkByActor(
    payload: SendUserPasswordResetLinkByActorEventPayload
  ): void;
  enqueueForceDelete(payload: EnqueueForceDeleteEventPayload): void;
}

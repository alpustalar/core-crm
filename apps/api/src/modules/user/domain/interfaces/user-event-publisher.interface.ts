import { CreateUserEventPayload } from '../events/create-user.event';
import { UpdateUserByStaffEventPayload } from '../events/update-user-by-staff.event';
import { EnqueueForceDeleteEventPayload } from '@modules/user/domain/events/enqueue-force-delete.event';
import { SendUserPasswordResetLinkByActorEventPayload } from '@modules/user/domain/events/send-user-password-reset-link-by-actor.event';

export const USER_EVENT_PUBLISHER = 'IUserEventPublisher';

export interface IUserEventPublisher {
  create(payload: CreateUserEventPayload): void;
  sendUserPasswordResetLinkByActor(
    payload: SendUserPasswordResetLinkByActorEventPayload
  ): void;
  updateUserByStaff(payload: UpdateUserByStaffEventPayload): void;
  enqueueForceDelete(payload: EnqueueForceDeleteEventPayload): void;
}

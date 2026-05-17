import { CreateUserEventPayload } from '../events/create-user.event';
import { UpdateUserByStaffEventPayload } from '../events/update-user-by-staff.event';
import { EnqueueForceDeleteEventPayload } from '@modules/user/domain/events/enqueue-force-delete.event';
import { SendUserPasswordResetLinkByActorEventPayload } from '@modules/user/domain/events/send-user-password-reset-link-by-actor.event';

export interface IUserEventPublisher {
  create(event: CreateUserEventPayload): void;
  sendUserPasswordResetLinkByActor(
    event: SendUserPasswordResetLinkByActorEventPayload
  ): void;
  updateUserByStaff(event: UpdateUserByStaffEventPayload): void;
  enqueueForceDelete(event: EnqueueForceDeleteEventPayload): void;
}

export const USER_EVENT_PUBLISHER_TOKEN = 'IUserEventPublisher';

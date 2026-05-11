import { ICreateUserEventParams } from '../events/create-user.event';
import { IUpdateUserByStaffEventParams } from '../events/update-user-by-staff.event';
import { IEnqueueForceDeleteEventParams } from '@modules/user/domain/events/enqueue-force-delete.event';
import { SendUserPasswordResetLinkByActorEventParams } from '@modules/user/domain/events/send-user-password-reset-link-by-actor.event';

export interface IUserEventPublisher {
  create(event: ICreateUserEventParams): void;
  sendUserPasswordResetLinkByActor(
    event: SendUserPasswordResetLinkByActorEventParams
  ): void;
  updateUserByStaff(event: IUpdateUserByStaffEventParams): void;
  enqueueForceDelete(event: IEnqueueForceDeleteEventParams): void;
}

export const USER_EVENT_PUBLISHER_TOKEN = 'IUserEventPublisher';

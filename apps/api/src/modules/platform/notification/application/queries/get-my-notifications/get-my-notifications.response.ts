import { QueryResponse } from '@shared/common/response/response.interface';
import { StaffNotificationListItem } from '@modules/platform/notification/domain/contracts/staff-notification';

export type GetMyNotificationsResponse = QueryResponse<
  StaffNotificationListItem[]
>;

import { QueryResponse } from '@shared/common/response/response.interface';

export type GetUnreadCountResponse = QueryResponse<{ unreadCount: number }>;

import { AdminRequestTypeType as AdminRequestType } from '@input-type-schemas/AdminRequestTypeSchema';
import { AdminRequestStatusType as AdminRequestStatus } from '@input-type-schemas/AdminRequestStatusSchema';
import { Pagination } from '@shared/common';

// ==========================================
// 2. TALEP FİLTRELEME SÖZLEŞMELERİ (FILTERS)
// ==========================================

export interface FindAdminRequestsFilter {
  type?: AdminRequestType;
  status?: AdminRequestStatus; //  PENDING, APPROVED, REJECTED
  organizationId?: string;
  pagination: Pagination;
}

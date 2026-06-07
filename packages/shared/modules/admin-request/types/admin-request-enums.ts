export const AdminRequestType = {
  CLINIC_DELETION: 'CLINIC_DELETION',
  ORGANIZATION_DELETION: 'ORGANIZATION_DELETION',
} as const;
export type AdminRequestType =
  (typeof AdminRequestType)[keyof typeof AdminRequestType];

export const AdminRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type AdminRequestStatus =
  (typeof AdminRequestStatus)[keyof typeof AdminRequestStatus];

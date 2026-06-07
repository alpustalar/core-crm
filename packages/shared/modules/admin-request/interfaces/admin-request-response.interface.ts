export interface AdminRequestResponse {
  id: string;
  type: string;
  status: string;
  targetId: string;
  requestedBy: string;
  organizationId: string | null;
  metadata: Record<string, unknown> | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

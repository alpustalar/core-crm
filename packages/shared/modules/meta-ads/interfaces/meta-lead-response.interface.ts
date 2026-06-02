export interface MetaLeadResponse {
  id: string;
  metaLeadId: string;
  campaignId: string | null;
  campaignName: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  status: 'NEW' | 'MATCHED' | 'CONVERTED' | 'INVALID';
  matchedPatientId: string | null;
  matchedAppointmentId: string | null;
  matchedAt: Date | null;
  createdAt: Date;
}

export interface ConvertLeadResponse {
  id: string;
  patientId: string | null;
  appointmentId: string | null;
  convertedAt: Date;
}

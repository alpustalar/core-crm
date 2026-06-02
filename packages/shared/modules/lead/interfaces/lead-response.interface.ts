export interface LeadResponse {
  id: string;
  clinicId: string;
  source: 'WHATSAPP' | 'MANUAL';
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  assignedToId: string | null;
  patientId: string | null;
  appointmentId: string | null;
  convertedAt: Date | null;
  lostReason: string | null;
  lostAt: Date | null;
  whatsAppConversationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** FE tüketimi için aktivite kaydı (satış zaman çizelgesi + görev listesi). */
export interface ActivityResponse {
  id: string;
  clinicId: string;
  organizationId: string;
  leadId: string | null;
  patientId: string | null;
  type: 'CALL' | 'NOTE' | 'TASK' | 'MEETING';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  subject: string;
  notes: string | null;
  assignedToId: string | null;
  createdById: string | null;
  dueAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

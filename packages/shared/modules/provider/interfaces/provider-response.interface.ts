export interface IProviderResponse {
  id: string;
  title?: string;
  specialty: string;
  publicPhone?: string;
  publicEmail?: string;
  isActive: boolean;
  createdAt: Date;
  clinicId: string;
  userId: string;
}

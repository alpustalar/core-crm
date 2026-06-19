export interface WhatsappChannelResponse {
  id: string;
  clinicId: string;
  phoneNumberId: string;
  wabaId: string | null;
  displayPhoneNumber: string | null;
  /** Gerçek token sızdırılmaz; yalnızca yapılandırılmış olup olmadığı bilgisi. */
  hasAccessToken: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

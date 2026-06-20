/** WhatsApp Business işletme profili görünümü. */
export interface WhatsappBusinessProfileView {
  about: string | null;
  address: string | null;
  description: string | null;
  email: string | null;
  vertical: string | null;
  websites: string[];
  profilePictureUrl: string | null;
}

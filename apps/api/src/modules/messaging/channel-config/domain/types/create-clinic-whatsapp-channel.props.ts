export interface CreateClinicWhatsappChannelProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  phoneNumberId: string;
  wabaId?: string | null;
  displayPhoneNumber?: string | null;
  accessToken?: string | null;
  verifyToken?: string | null;
  isActive?: boolean;
  registrationPin?: string | null;
  registeredAt?: Date | null;
  tokenExpiresAt?: Date | null;
  qualityRating?: string | null;
  messagingTier?: string | null;
}

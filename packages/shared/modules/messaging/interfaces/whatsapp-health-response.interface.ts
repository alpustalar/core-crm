/** Numaranın canlı sağlık/kalite görünümü (Graph API'den anlık çekilir). */
export interface WhatsappChannelHealthView {
  phoneNumberId: string;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  qualityRating: string | null; // GREEN | YELLOW | RED
  messagingTier: string | null; // ör. TIER_1K
  nameStatus: string | null;
  codeVerificationStatus: string | null;
}

/**
 * Webhook `phone_number_quality_update` olayından gelen numara kalitesi/tier bilgisini
 * kanala işler. Routing display_phone_number iledir (kalite webhook'u phone_number_id
 * taşımaz). Public webhook akışından dispatch edilir; dönüş void.
 */
export class RecordWhatsappQualityCommand {
  readonly __responseType!: void;
  constructor(
    public readonly displayPhoneNumber: string,
    public readonly qualityRating?: string | null,
    public readonly messagingTier?: string | null
  ) {}
}

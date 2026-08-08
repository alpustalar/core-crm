import { MessageChannelType as MessageChannel } from '@shared';

export const CONTACT_RESOLVER_PORT = Symbol('IContactResolverPort');

/** Reklamdan (Click-to-Chat) gelen yazışmanın attribution bilgisi. */
export interface AdReferralAttribution {
  readonly adId: string | null;
  readonly ctwaClid: string | null;
  readonly sourceUrl: string | null;
}

export interface FindPatientIdPayload {
  readonly clinicId: string;
  readonly channel: MessageChannel;
  /** Kanalın kontak kimliği: WHATSAPP'ta telefon, TELEGRAM'da chatId, INSTAGRAM'da IGSID. */
  readonly contactPhone: string;
  /** Kontak paylaşımıyla gelen doğrulanmış telefon (Telegram/Instagram akışı). */
  readonly matchPhone?: string | null;
}

export interface RegisterAdReferralLeadPayload {
  readonly clinicId: string;
  readonly organizationId: string;
  readonly channel: MessageChannel;
  readonly contactPhone: string;
  readonly contactName?: string | null;
  readonly referral: AdReferralAttribution;
}

/**
 * Gelen mesajın kontağını CRM tarafında çözen sınır (anti-corruption port).
 *
 * Messaging, hasta ve lead kavramlarının **kendisine** değil yalnız bu iki soruya ihtiyaç
 * duyar: "bu kontak hangi hastaya ait?" ve "bu reklam yazışması için bir lead aç". Port,
 * `Patient`/`Lead` sözleşmelerinin messaging'e sızmasını engeller — implementasyon Faz
 * 1'de in-process bus dağıtımı, Faz 3'te NATS istemcisidir; handler ikisini de bilmez.
 *
 * İki metot da **best-effort**'tur: hata halinde `null` döner ve gelen mesajın işlenmesini
 * bloklamaz (kontak çözülemese de mesaj kaydedilmeli).
 */
export interface IContactResolverPort {
  /**
   * Kontağın hasta kaydını kanal-farkındalı çözer. WhatsApp'ta `contactPhone` gerçek
   * telefondur; Telegram/Instagram'da kimlik numarası olduğundan yalnız `matchPhone`
   * kullanılır (yanlış eşleşmeyi önler). Eşleşme yoksa misafir → `null`.
   */
  findPatientId(payload: FindPatientIdPayload): Promise<string | null>;

  /**
   * Reklamdan gelen misafir yazışması için attribution'lı lead açar.
   * Dönüş: lead id, üretilemezse `null`.
   */
  registerAdReferralLead(
    payload: RegisterAdReferralLeadPayload
  ): Promise<string | null>;
}
